"use client";
import Pricing from "./components/Pricing";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Testimonials from "./components/Testimonials";
import CookiesBanner from "./components/CookiesBanner";
import Subscribe from "./components/Subscribe";
import WaitingList from "./components/Waiting";
import WaitingHero from "./components/WaitingHero";
import WaitingHeader from "./components/WaitingHeader";
import WaitingDemo from "./components/WaitingDemo";

export default function Home() {
  return (
    <div>
      {/* Header */}
      {/* <Header /> */}
      <WaitingHeader />

      {/* Cookies Banner */}
      {/* <CookiesBanner /> */}

      {/* Hero */}
      {/* <Hero /> */}
      <WaitingHero />

      {/* Demo */}
      <WaitingDemo />

      {/* <!-- Testimonials --> */}
      {/* <Testimonials /> */}

      {/* <!-- Pricing --> */}
      {/* <Pricing /> */}

      {/* <!-- FAQ --> */}
      {/* <Faq /> */}

      {/* Subscribe */}
      {/* <Subscribe /> */}
      <WaitingList />

      {/* Footer */}
      <Footer />
    </div>
  );
}
