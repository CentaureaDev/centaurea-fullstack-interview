import { AppStore } from 'centaurea-ui-shared';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';
export const appStore = new AppStore(apiUrl);
