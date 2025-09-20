interface VirtualColumnOptions {
  currentValue: string;
  setValue: (value: string) => void;
  getCounts: () => Map<string, number>;
  isMultiple?: boolean;
}

/**
 * Creates a virtual column configuration for use with DataTableFacetedFilter
 * Handles both single and multiple selection modes
 */
export function createVirtualColumn({
  currentValue,
  setValue,
  getCounts,
  isMultiple = false,
}: VirtualColumnOptions) {
  return {
    getFilterValue: () => {
      if (!currentValue) return undefined;
      return isMultiple ? currentValue.split(',') : [currentValue];
    },
    setFilterValue: (value: unknown) => {
      if (typeof value === 'string') {
        // Single value (from single select)
        setValue(value);
      } else {
        // Array of values (from multiple select or array input)
        const arr = value as string[];
        if (!arr || arr.length === 0) {
          setValue('');
        } else {
          setValue(isMultiple ? arr.join(',') : arr[0]);
        }
      }
    },
    getFacetedUniqueValues: getCounts,
  };
}
