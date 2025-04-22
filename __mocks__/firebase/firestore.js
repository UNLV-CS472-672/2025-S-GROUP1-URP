export const doc = jest.fn();
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({}) }));
export const collection = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const getDocs = jest.fn(() => Promise.resolve({ empty: true, docs: [] }));
export const deleteDoc = jest.fn();
