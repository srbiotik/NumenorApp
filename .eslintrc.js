module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    'prettier/prettier': 'error', // Ensures that your code conforms to Prettier formatting
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }], // Allows JSX syntax in .js and .jsx files
    'react-hooks/rules-of-hooks': 'error', // Enforces the rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Warns about the dependencies for Hooks
    'react/prop-types': 'off', // Disables prop-types rule, as TypeScript is being used for type checking
  },
  settings: {
    react: {
      version: 'detect', // Automatically detects the version of React to use
    },
  },
};
