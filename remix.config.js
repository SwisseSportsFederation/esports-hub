const {
  createRoutesFromFolders,
} = require("@remix-run/v1-route-convention");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // serverBuildTarget: "vercel", TODO: Test if it works without this and if not try to add the new settings.

  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",

  routes(defineRoutes) {
    // uses the v1 route convention, works in v1.15+ and v2
    return createRoutesFromFolders(defineRoutes);
  },
};
