Object.defineProperty(window, 'getComputedStyle', {
  value: (node: any) => ({
    getPropertyValue: (prop: any) => {
      return '';
    }
  }),
  writable: false
});
