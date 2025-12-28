import axios from "axios";

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACK_END}/api`,
  withCredentials: true,
});

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function onRefreshFailed(error: any) {
  subscribers = [];
  // Clear any stored tokens and redirect to login
  if (typeof window !== 'undefined') {
    // Clear cookies if possible (though httpOnly cookies can't be accessed)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    window.location.href = '/login';
  }
}

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If token expired (401) and we haven't retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if this IS the refresh token request
      if (originalRequest.url?.includes('/auth/token')) {
        onRefreshFailed(err);
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribers.push((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACK_END}/api/auth/token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        onRefreshed(newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError: any) {
        // If refresh fails with 401 or 403, user needs to login again
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          onRefreshFailed(refreshError);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default instance;