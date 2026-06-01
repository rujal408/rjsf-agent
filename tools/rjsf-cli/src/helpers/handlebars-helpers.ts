import Handlebars from 'handlebars';

/**
 * Register all custom Handlebars helpers used across templates.
 */
export function registerHelpers(hbs: typeof Handlebars): void {
  // Equality check: {{#if (eq a b)}} or {{#eq a b}}...{{/eq}}
  hbs.registerHelper('eq', function (a: unknown, b: unknown) {
    return a === b;
  });

  hbs.registerHelper('neq', function (a: unknown, b: unknown) {
    return a !== b;
  });

  // Check if array includes a value
  hbs.registerHelper('includes', function (arr: unknown[], value: unknown) {
    return Array.isArray(arr) && arr.includes(value);
  });

  // Capitalize first letter
  hbs.registerHelper('capitalize', function (str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Convert camelCase to Title Case
  hbs.registerHelper('camelToTitle', function (str: string) {
    if (!str) return '';
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  });

  // Convert snake_case to Title Case
  hbs.registerHelper('snakeToTitle', function (str: string) {
    if (!str) return '';
    return str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  });

  // Safe JSON.stringify for embedding in templates
  hbs.registerHelper('json', function (obj: unknown) {
    return new hbs.SafeString(JSON.stringify(obj, null, 2));
  });

  // JSON stringify single-line (for inline values)
  hbs.registerHelper('jsonInline', function (obj: unknown) {
    return new hbs.SafeString(JSON.stringify(obj));
  });

  // Greater than
  hbs.registerHelper('gt', function (a: number, b: number) {
    return a > b;
  });

  // Greater than or equal
  hbs.registerHelper('gte', function (a: number, b: number) {
    return a >= b;
  });

  // Logical OR
  hbs.registerHelper('or', function (...args: unknown[]) {
    // Last arg is the Handlebars options object
    const values = args.slice(0, -1);
    return values.some(Boolean);
  });

  // Logical AND
  hbs.registerHelper('and', function (...args: unknown[]) {
    const values = args.slice(0, -1);
    return values.every(Boolean);
  });

  // Logical NOT
  hbs.registerHelper('not', function (value: unknown) {
    return !value;
  });

  // Repeat a block N times (for step dots, etc.)
  hbs.registerHelper('times', function (n: number, options: Handlebars.HelperOptions) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += options.fn({ index: i, first: i === 0, last: i === n - 1 });
    }
    return result;
  });

  // Get array length
  hbs.registerHelper('length', function (arr: unknown[]) {
    return Array.isArray(arr) ? arr.length : 0;
  });

  // Subtract
  hbs.registerHelper('subtract', function (a: number, b: number) {
    return a - b;
  });

  // Lowercase
  hbs.registerHelper('lowercase', function (str: string) {
    return str?.toLowerCase() ?? '';
  });

  // Convert to camelCase from PascalCase
  hbs.registerHelper('lcFirst', function (str: string) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  });
}
