export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    plugins: [daisyui],
    daisyui: {
      themes: [
        {
          mytheme: {
            primary: "#A58FCC",
            secondary: "#7b669f",
            accent: "#37cdbe",
            neutral: "#3d4451",
            "base-100": "#ffffff",
          },
        },
        "dark",
        "cupcake",
      ],
    },
  };