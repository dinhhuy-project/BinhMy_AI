/**
 * API Keys Configuration
 * Define all API keys as constants here
 */

export const API_KEYS = {
  primary: 'AIzaSyDSwJp_V2_-LKU0UzrZ6MtFA1fBzsRjUpo',
  backup1: 'AIzaSyBMzGv3YWuek8Y1ZivlCcR3hwGqPOX8r3I',
  backup2: 'AIzaSyCLa8aPO4bz_l8ZI9gLTRowX0HiRhGNshk',
  backup3: 'AIzaSyBaKfdaeZiOMtUlAhQ8w2NnkN9NE6W2ZlU',
};

/**
 * Get all API keys as an array
 */
export const getAllApiKeys = (): string[] => {
  return [
    API_KEYS.primary,
    API_KEYS.backup1,
    API_KEYS.backup2,
    API_KEYS.backup3,
  ];
};
