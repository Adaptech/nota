module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "env": {
    "browser": true
  },
  "plugins": [
    "react",
      "jsx-a11y",
      "import"
  ],
  "rules": {
    "max-len": ["warn", 200, 2],
    "no-plusplus": "off",
    "no-bitwise": "off",
    "react/prefer-stateless-function": "off",
    "react/forbid-prop-types": "off",
    "react/require-default-props": "off",
    "react/sort-comp": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "no-trailing-spaces": "warn",
    "spaced-comment": "warn",
    "no-unused-vars": "warn",
    "no-debugger": "warn",
    "no-lonely-if": "off",
    "indent": [2, 2]
  }
};
