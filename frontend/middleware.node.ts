import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { UserSubscription } from "@/utils/schema";
import { eq } from "drizzle-orm";

// Environment variables
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/dashboard/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // First handle protected routes
  if (isProtectedRoute(req)) {
    auth().protect();

    // After protecting the route, check and create subscription if needed
    const userId = auth().userId;

    if (userId) {
      try {
        // Check if user already has a subscription
        const existingSubscription = await db
          .select()
          .from(UserSubscription)
          .where(eq(UserSubscription.userId, userId))
          .limit(1);

        // If no subscription exists, create one
        if (!existingSubscription || existingSubscription.length === 0) {
          await db
            .insert(UserSubscription)
            .values({
              userId: userId,
              stripeCustomerId: "not_set",
              stripeSubscriptionId: "not_set",
              stripePriceId: "not_set",
              stripeStatus: "inactive",
              plan: "free",
              credits: 10000,
              stripeCurrentPeriodEnd: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            })
            .execute();

          console.log("Created subscription for user:", userId);
        }
      } catch (error) {
        console.error("Error managing user subscription:", error);
        // Continue the request even if subscription creation fails
        // You might want to add some monitoring here for production
      }
      
      // Sync user data to MongoDB only if this is the first login
      try {
        if (userId) {
          // Check if user has a sync record in our database
          // If they don't exist in our subscription table, they likely need to be synced
          // We're reusing the check we already did for subscriptions
          const existingSubscription = await db
            .select()
            .from(UserSubscription)
            .where(eq(UserSubscription.userId, userId))
            .limit(1);

          // Only call the MongoDB sync endpoint if this appears to be a new user
          // (i.e., we just created their subscription record)
          const isNewUser = !existingSubscription || existingSubscription.length === 0;
          
          if (isNewUser) {
            // This is likely a first-time login or new user, so sync with MongoDB
            const syncUrl = `${BACKEND_API_URL}/api/users/clerk-sync`;
            const requestBody = {
              clerk_id: userId,
              is_active: true,
            };
            
            console.log('Starting initial sync to MongoDB for new user:', userId);
            
            // Run the sync in the background
            fetch(syncUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }).catch(error => {
              console.error('Initial MongoDB sync failed:', error);
            });
          }
        }
      } catch (error) {
        // Just log the error, don't block the user's navigation
        console.error('Error setting up MongoDB sync in middleware:', error);
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};