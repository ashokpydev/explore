import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["playwright-report/**", "test-results/**"] },
  ...nextVitals,
  ...nextTypeScript
];

export default eslintConfig;
