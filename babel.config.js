const presets = [
  [
    "@babel/env",
    {
      targets: {
        firefox: "65",
        chrome: "71",
      },
      useBuiltIns: "usage",
    },
  ],
];

module.exports = { presets };