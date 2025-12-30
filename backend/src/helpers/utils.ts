/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import { z } from 'zod';
import crypto from 'crypto';

const PASSWORD_REGEX = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})');

export const pick = <T extends object, K extends keyof T>(
  objOrArray: T | T[],
  keys: K[],
): Pick<T, K> | Pick<T, K>[] => {
  const pickObject = (obj: T): Pick<T, K> =>
    keys.reduce((acc, key) => {
      if (key in obj) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as Pick<T, K>);

  // Check if input is an array
  if (Array.isArray(objOrArray)) {
    return objOrArray.map((obj) => pickObject(obj));
  }

  // Otherwise, it's a single object
  return pickObject(objOrArray);
};

export const isValidMongoDbIdSchema = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const isValidMongoDbId = (id: string) => isValidMongoDbIdSchema.safeParse(id).success;

export const omit = <T extends object, K extends keyof T>(
  objOrArray: T | T[],
  keys: K[],
): Omit<T, K> | Omit<T, K>[] => {
  const omitObject = (obj: T): Omit<T, K> =>
    Object.keys(obj).reduce((acc, key) => {
      // Check if the key is not in the list of keys to omit
      if (!keys.includes(key as K)) {
        // Assert the correct key type and assign the value
        (acc as any)[key] = obj[key as keyof T];
      }
      return acc;
    }, {} as Omit<T, K>);

  // Check if the input is an array
  if (Array.isArray(objOrArray)) {
    return objOrArray.map((item) => omitObject(item));
  }

  // Otherwise, it's a single object
  return omitObject(objOrArray);
};

export const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

export const generateOtp = (length: number = 6): string => {
  const digits = '0123456789';
  let otp: string = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const generateAlphaNumericCode = (length = 8): string => {
  const chars = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
  };

  // Ensure password contains at least one character from each required group
  let password = [
    chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)],
    chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)],
    chars.numbers[Math.floor(Math.random() * chars.numbers.length)],
  ];

  // Fill the rest of the password to reach the minimum length of 8
  const allChars = chars.lowercase + chars.uppercase + chars.numbers;
  while (password.length < length) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle password array and join it as a string
  password = password.sort(() => 0.5 - Math.random());

  const tempPassword = password.join('');

  return tempPassword;
};

export const generateTempPassword = (length = 8): string => {
  const chars = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '.@#',
  };

  // Ensure password contains at least one character from each required group
  let password = [
    chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)],
    chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)],
    chars.numbers[Math.floor(Math.random() * chars.numbers.length)],
    chars.symbols[Math.floor(Math.random() * chars.symbols.length)],
  ];

  // Fill the rest of the password to reach the minimum length of 8
  const allChars = chars.lowercase + chars.uppercase + chars.numbers + chars.symbols;
  while (password.length < length) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle password array and join it as a string
  password = password.sort(() => 0.5 - Math.random());

  const tempPassword = password.join('');

  // Verify if the password meets the regex requirement
  return PASSWORD_REGEX.test(tempPassword) ? tempPassword : generateTempPassword();
};

type UniqueByFields<T> = (array: T[], fields: (keyof T)[]) => T[];

export const getUniqueArrayByFields: UniqueByFields<any> = (array, fields) => {
  const uniqueMap = new Map<string, any>();

  array.forEach((item) => {
    const key = fields.map((field) => item[field]).join('-');
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  return Array.from(uniqueMap.values());
};

export const keyByFieldOrFields = <T>(
  array: T[],
  fields: keyof T | (keyof T)[],
): Record<string, T> => {
  return array.reduce((result, item) => {
    const key = Array.isArray(fields)
      ? fields.map((field) => item[field]).join('-') // Composite key for multiple fields
      : item[fields]; // Single field key

    result[key as string] = item; // Type assertion to ensure the key is string
    return result;
  }, {} as Record<string, T>);
};

/**
 * Groups an array of objects by a specified field or multiple fields.
 *
 * @param array - The array of objects to group.
 * @param fields - A single field or an array of fields to group by.
 * @returns An object where keys are the grouped field values and values are arrays of grouped objects.
 */
export function groupByFieldOrFields<T>(
  array: T[],
  fields: keyof T | (keyof T)[],
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((result, item) => {
    const key = Array.isArray(fields)
      ? fields.map((field) => item[field]).join('-') // Composite key for multiple fields
      : item[fields]; // Single field key

    const groupKey = String(key); // Ensuring the key is always a string

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
    return result;
  }, {});
}

export const isDateWithinRange = (
  date: Date | string,
  rangeStart: Date | string,
  rangeEnd: Date | string,
): boolean => {
  const dateValue = new Date(date).getTime();
  const startValue = new Date(rangeStart).getTime();
  const endValue = new Date(rangeEnd).getTime();

  return dateValue >= startValue && dateValue <= endValue;
};

type GroupByFields<T> = (array: T[], fields: keyof T | (keyof T)[]) => Record<string, T[]>;

export const groupByFields: GroupByFields<any> = (array, fields) => {
  const groupedObject: Record<string, any[]> = {};

  array.forEach((item) => {
    // Normalize `fields` to always be an array
    const fieldArray = Array.isArray(fields) ? fields : [fields];

    // Create a key based on the specified fields
    const key = fieldArray.map((field) => item[field]).join('-');

    // If the key doesn't exist, initialize it with an empty array
    if (!groupedObject[key]) {
      groupedObject[key] = [];
    }

    // Add the current item to the corresponding group
    groupedObject[key].push(item);
  });

  return groupedObject;
};

type SortOrder = 'asc' | 'desc';
interface SortField<T> {
  key: keyof T;
  order?: SortOrder;
}
/**
 * Sorts an array of objects based on specified fields and order.
 *
 * @param array - The array to be sorted.
 * @param fields - A single sort field or an array of sort fields.
 * @returns A new sorted array.
 */
export const sortArray = <T>(array: T[], fields: SortField<T> | SortField<T>[]): T[] => {
  const fieldArray: SortField<T>[] = Array.isArray(fields) ? fields : [fields]; // Normalize to an array

  return [...array].sort((a, b) => {
    for (const { key, order = 'asc' } of fieldArray) {
      const valueA = a[key];
      const valueB = b[key];

      // Handle undefined or null values safely
      if (valueA == null && valueB == null) continue;
      if (valueA == null) return order === 'asc' ? 1 : -1;
      if (valueB == null) return order === 'asc' ? -1 : 1;

      // Compare values (handling numbers and strings properly)
      const comparison =
        typeof valueA === 'string' && typeof valueB === 'string'
          ? valueA.localeCompare(valueB)
          : valueA > valueB
          ? 1
          : -1;

      if (comparison !== 0) return order === 'asc' ? comparison : -comparison;
    }

    return 0; // All fields are equal
  });
};

/**
 * Gets all nested children for a given parent ID.
 *
 * @param array - Array of nodes representing the flat hierarchy.
 * @param parentIds - The ID of the parent node.
 * @param parentIdKey - The key used to reference the parent ID.
 * @returns A flattened list of all children.
 */
export const getChildrenByParentId = <T extends Record<string, any>>(
  array: T[],
  parentIds: string | string[],
  parentIdKey: keyof T,
): T[] => {
  const parentIdList = Array.isArray(parentIds) ? parentIds : [parentIds]; // Normalize parentIds to an array
  const result: T[] = array.filter((one) => parentIdList.includes(one._id?.toString() || one.id?.toString()));

  //all id list that are included in result array
  const includedIds = [...parentIdList];

  /**
   * Recursively collects all children for the given parent IDs.
   *
   * @param currentParentIds - The current parent IDs being processed.
   */
  const collectChildren = (currentParentIds: string[]) => {
    for (const node of array) {
      if (currentParentIds.includes(node[parentIdKey] as string)) {
        if (!includedIds.includes(node._id?.toString() || node.id?.toString())) {
          result.push(node);
          includedIds.push(node._id?.toString() || node.id?.toString());
        }
        collectChildren([node._id?.toString() || node.id?.toString()]); // Recursively collect children of this node
      }
    }
  };

  collectChildren(parentIdList); // Start collecting from the given parent IDs

  return result;
};

/**
 * Gets all nested children for a given parent ID.
 *
 * @param array - Array of nodes representing the flat hierarchy.
 * @param childIds - The ID of the parent node.
 * @param parentIdKey - The key used to reference the parent ID..
 * @returns A flattened list of all parents.
 */
export const getParentsByChildrenId = <T extends Record<string, any>>(
  array: T[],
  childIds: string | string[],
  parentIdKey: keyof T,
): T[] => {
  const childIdList = Array.isArray(childIds) ? childIds : [childIds]; // Normalize childIds to an array
  const result: T[] = [];
  const includedIds = new Set<string>(); // Track included IDs to avoid duplicates

  /**
   * Recursively collects all parent nodes for the given child IDs.
   *
   * @param currentChildIds - The current child IDs being processed.
   */
  const collectParents = (currentChildIds: string[]) => {
    for (const childId of currentChildIds) {
      const childNode = array.find((node) => (node._id?.toString() || node.id?.toString()) === childId);
      if (childNode && !includedIds.has(childNode._id?.toString() || childNode.id?.toString())) {
        result.push(childNode); // Add the current child node to the result
        includedIds.add(childNode._id?.toString() || childNode.id?.toString());

        // Recursively find parents if `parentIdKey` exists
        if (childNode[parentIdKey]) {
          collectParents([childNode[parentIdKey]]);
        }
      }
    }
  };

  collectParents(childIdList); // Start collecting from the provided child IDs

  return result;
};

/**
 * Builds a nested structure from a flat array of items based on a parent-child relationship.
 *
 * @param items - The array of items that need to be organized.
 * @param parentIdKey - The key that refers to the parent ID in each item.
 * @param nestedListKey - The key that will store the nested child items for each parent.
 *
 * @returns An array of root-level items, each containing its nested children in the `nestedListKey`.
 */
export const buildNestedStructure = <T extends Record<string, any>>(
  items: T[],
  parentIdKey: keyof T,
  nestedListKey: string,
): T[] => {
  // Clone the items to avoid modifying the original array
  const clonedItems = JSON.parse(JSON.stringify(items));

  const map = new Map<string, T>(); // Map to associate items by their `id`
  const roots: T[] = []; // Array to hold root-level items
  const orphans: T[] = []; // Array to hold orphaned items

  // Populate the map and initialize the nested list
  clonedItems.forEach((item: T) => {
    map.set(item._id?.toString() || item.id?.toString(), item);
    (item as any)[nestedListKey] = []; // Initialize children array
  });

  // Build the nested structure
  clonedItems.forEach((item: T) => {
    const parentId = item[parentIdKey] as string | undefined;

    if (!parentId) {
      // Root-level item (no parentId)
      roots.push(item);
    } else {
      // Find parent and add this item as a child
      const parent = map.get(parentId);
      if (parent) {
        (parent as any)[nestedListKey].push(item);
      } else {
        orphans.push(item); // Add to orphaned items if parent is missing
      }
    }
  });

  // Append orphaned items to the roots array or process them differently if required
  if (orphans.length > 0) {
    roots.push(...orphans); // Add orphaned items to the roots array
  }

  return roots; // Return the root-level items, each containing its nested children
};

/**
 * Flattens a nested structure into a flat array while preserving the parent-child relationship.
 *
 * @param items - The nested array of items to be flattened.
 * @param parentIdKey - The key that will store the parent ID in each flattened item.
 * @param nestedListKey - The key that contains the nested child items.
 *
 * @returns A flat array of items, each containing a reference to its parent ID.
 */
export const flattenNestedStructure = <T extends Record<string, any>>(
  items: T[],
  parentIdKey: keyof T,
  nestedListKey: string,
): Omit<T, typeof nestedListKey>[] => {
  const flatArray: Omit<T, typeof nestedListKey>[] = [];

  const processItems = (items: T[], parentId?: string) => {
    items.forEach((item) => {
      // Create a shallow copy without the nested list key
      const { [nestedListKey]: children, ...rest } = item;

      // Assign the parent ID
      const flattenedItem = { ...rest, [parentIdKey]: parentId } as Omit<T, typeof nestedListKey>;
      flatArray.push(flattenedItem);

      // Recursively process children if they exist
      if (Array.isArray(children) && children.length > 0) {
        processItems(children, String(item._id || item.id));
      }
    });
  };

  processItems(items);
  return flatArray;
};

export const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const normalizeToArray = (value: string | string[] | undefined): string[] | undefined =>
  value ? (Array.isArray(value) ? value : [value]) : undefined;

export const generateHmacSHA256 = (data: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

export const verifyHmacSHA256 = (data: string, secret: string, signature: string): boolean => {
  const generated = generateHmacSHA256(data, secret);
  return generated === signature;
};

export const generateVoucherCode = (format = 'XXXX-XXXX-XXXX-XXXX') => {
  const generateSegment = (length: number): string => {
    return crypto.randomBytes(length).toString('hex').toUpperCase().slice(0, length);
  };
  return format
    .split('-')
    .map((part) => generateSegment(part.length))
    .join('-');
};
