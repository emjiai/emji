/** @type {import('next').NextConfig} */
import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'soosimage.s3.eu-west-2.amazonaws.com',
        pathname: '**',
      },
    ],
  },
  webpack(config, { isServer }) {
    // Add SVGR support
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    // Add fallback for node modules not handled by Webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      async_hooks: false,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      os: false,
      util: false,
      buffer: false,
      "node:fs/promises": false,
    };

    // Handle PptxGenJS module issues
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:fs/promises': false,
        'fs': false,
        'path': false,
      };
    }

    // Ignore node: protocol imports
    config.externals = [
      ...(config.externals || []),
      ({ request }, callback) => {
        if (request?.startsWith('node:')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      }
    ];

    return config;
  },
  transpilePackages: ['pptxgenjs'],
};

export default withNextra(nextConfig);

// /** @type {import('next').NextConfig} */
// import nextra from "nextra";

// const withNextra = nextra({
//   theme: "nextra-theme-docs",
//   themeConfig: "./theme.config.jsx",
// });

// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'cdn-icons-png.flaticon.com',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'img.icons8.com',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'ui-avatars.com',
//         pathname: '**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'soosimage.s3.eu-west-2.amazonaws.com',
//         pathname: '**',
//       },
//     ],
//   },
//   webpack(config) {
//     // Add SVGR support
//     config.module.rules.push({
//       test: /\.svg$/,
//       use: [
//         {
//           loader: "@svgr/webpack",
//           options: {
//             typescript: true,
//             icon: true,
//           },
//         },
//       ],
//     });

//     // Add fallback for node modules not handled by Webpack
//     config.resolve.fallback = {
//       ...config.resolve.fallback,
//       async_hooks: false, // Ignore async_hooks for Webpack
//     };

//     return config;
//   },
// };

// export default withNextra(nextConfig);
