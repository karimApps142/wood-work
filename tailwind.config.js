/** @type {import('tailwindcss').Config} */
module.exports = {
    // Update this to include the paths to all files that contain NativeWind classes
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],

    presets: [require("nativewind/preset")], // This preset is recommended for NativeWind v4+

    theme: {
        extend: {},
    },

    plugins: [],
};