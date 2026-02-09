import axios from 'axios';

// API URL z env a fallvack
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8080/api'  // Development fallback
    : '/api'                       // Production fallback (relative path)
);

console.log('API Base URL:', API_BASE_URL); // Helpful for debugging

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor pro globální zpracování chyb
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - pouze vyčistíme localStorage, ale nepřesměrováváme automaticky
            // Přesměrování necháme na AuthContext
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (username: string, password: string) => {
        const response = await api.post('/login', { username, password });
        return {
            user: response.data,
            token: 'session-based'
        };
    },
    register: async (username: string, displayname: string, password: string) => {
        const response = await api.post('/register', { username, displayname, password });
        return {
            user: response.data,
            token: 'session-based'
        };
    },
    logout: () =>
        api.post('/logout'),
    // GET /user/me endpoint pro ověření sessiony
    verify: () =>
        api.get('/user/me'),
};

export const postsAPI = {
    getPostContents: (postId: number) =>
        api.get(`/post/${postId}/listcontents`),
    getPostLinkedContents: (postId: number) =>
        api.get(`/post/${postId}/linkedcontents`),
    getPostFiles: (postId: number) =>
        api.get(`/post/${postId}/listfiles`),
    downloadFile: (postId: number, attachmentId: number) =>
        api.get(`/post/${postId}/getfile/${attachmentId}`, { responseType: 'blob' }),

    // Správa příspěvků a obsahu
    createPost: () =>
        api.post('/post/create'), // Vytvoření prázdného příspěvku
    createContent: (postId: number, content: string) =>
        api.post(`/post/${postId}/newcontent`, { content }),
    updateContent: (postId: number, contentId: number, content: string) =>
        api.put(`/post/${postId}/editcontent`, { contentId, content }),
    deleteContent: (postId: number, contentId: number) =>
        api.delete(`/post/${postId}/deletecontent/${contentId}`),

    // Propojování obsahu se sociálními sítěmi
    linkContentToNetwork: (postId: number, contentId: number, networkId: number) =>
        api.post(`/post/${postId}/linkcontent/${contentId}/${networkId}`),
    unlinkContentFromNetwork: (postId: number, contentId: number, networkId: number) =>
        api.delete(`/post/${postId}/unlinkcontent/${contentId}/${networkId}`),

    // Endpointy pro správu souborů
    uploadFile: (postId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/post/${postId}/uploadfile`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    removeFile: (postId: number, attachmentId: number) =>
        api.delete(`/post/${postId}/removefile/${attachmentId}`),

    // Propojování souborů se sociálními sítěmi
    linkAttachmentToNetwork: (postId: number, attachmentId: number, networkId: number) =>
        api.post(`/post/${postId}/linkattachment/${attachmentId}/${networkId}`),
    unlinkAttachmentFromNetwork: (postId: number, attachmentId: number, networkId: number) =>
        api.delete(`/post/${postId}/unlinkattachment/${attachmentId}/${networkId}`),
    getPostLinkedAttachments: (postId: number) =>
        api.get(`/post/${postId}/linkedattachments`),

    // Smazání příspěvku
    deletePost: (postId: number) =>
        api.delete(`/post/${postId}/delete`),

    // Získání příspěvků z konkrétní sociální sítě
    getNetworkPosts: (networkId: number, page: number = 1, limit: number = 10) =>
        api.get(`/network/${networkId}/posts?page=${page}&limit=${limit}`),
    // Získání kompletních informací o příspěvku
    getPost: (postId: number) =>
        api.get(`/post/${postId}`),

    // Plánování příspěvků
    schedulePost: (postId: number, networkId: number, postDate: string) =>
        api.post(`/post/${postId}/schedule/${networkId}`, { postDate }),
    unschedulePost: (postId: number, networkId: number) =>
        api.delete(`/post/${postId}/unschedule/${networkId}`),

    // Okamžité odeslání příspěvků
    sendToAllNetworks: (postId: number) =>
        api.post(`/post/${postId}/send/all`),
    sendToNetwork: (postId: number, networkId: number) =>
        api.post(`/post/${postId}/send/${networkId}`),

    // Dostupné sítě pro připojování na daném příspěvku
    getPostAvailableNetworks: (postId: number) =>
        api.get(`/post/${postId}/availablenetworks`),

    // Detailní seznam příspěvků s informacemi o editorech
    getPostsDetailed: (page: number = 1, limit: number = 10) =>
        api.get(`/post/list/detailed?page=${page}&limit=${limit}`),
    getEditorPostsDetailed: (page: number = 1, limit: number = 10) =>
        api.get(`/post/editorlist/detailed?page=${page}&limit=${limit}`),

    // Filtrované příspěvky
    getFilteredPosts: (params: {
        page?: number;
        limit?: number;
        networkId?: number;
        startDate?: string;
        endDate?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.networkId) searchParams.append('networkId', params.networkId.toString());
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);

        return api.get(`/post/list/filtered?${searchParams.toString()}`);
    },

    // Endpointy pro správu editorů příspěvků
    addEditor: (postId: number, userId: number) =>
        api.post(`/post/${postId}/addeditor/${userId}`),
    removeEditor: (postId: number, userId: number) =>
        api.delete(`/post/${postId}/removeeditor/${userId}`),

    // Endpoint pro monitoring
    collectMonitorData: (postId: number) =>
        api.post(`/monitor/${postId}/collect`),

    // Endpoint pro získání maximální velikosti souborů
    getAttachmentSize: () =>
        api.get('/post/attachmentsize'),

    // Nové endpointy pro statistiky příspěvků
    getAvailableMetrics: (postId: number) =>
        api.get(`/monitor/${postId}/availablemetrics`),
    getNetworkGraphData: (postId: number, networkId: number, metrics?: string) => {
        const params = metrics ? `?metrics=${encodeURIComponent(metrics)}` : '';
        return api.get(`/monitor/${postId}/network/${networkId}/graph${params}`);
    },
    getCurrentMetrics: (postId: number) =>
        api.get(`/monitor/${postId}/currentmetrics`),
};

export const networkAPI = {
    getOwnedNetworks: () =>
        api.get('/network/list/owned'),
    getAllNetworks: () =>
        api.get('/network/list/all'),
    getNetwork: (networkId: number) =>
        api.get(`/network/${networkId}`),
    createNetwork: (data: { networkType: string; networkName: string; networkNote: string }) =>
        api.post('/network/add', data),
    updateNetwork: (networkId: number, data: { networkName: string; networkNote: string }) =>
        api.put(`/network/${networkId}/edit`, data),
    deleteNetwork: (networkId: number) =>
        api.delete(`/network/${networkId}/remove`),
    getNetworkTokens: (networkId: number) =>
        api.get(`/network/${networkId}/listtokens`),
    addNetworkToken: (networkId: number, data: any) =>
        api.post(`/network/${networkId}/addtoken`, data),
    removeNetworkToken: (networkId: number) =>
        api.delete(`/network/${networkId}/removetoken`),
    getNetworkPermissions: (networkId: number) =>
        api.get(`/network/${networkId}/listperm`),
    addNetworkPermission: (networkId: number, data: { granteeId: number; permission: 'read' | 'write' }) =>
        api.post(`/network/${networkId}/addperm`, data),
    changeNetworkPermission: (networkId: number, data: { granteeId: number; permission: 'read' | 'write' }) =>
        api.put(`/network/${networkId}/changeperm`, data),
    removeNetworkPermission: (networkId: number, granteeId: number) =>
        api.delete(`/network/${networkId}/removeperm/${granteeId}`),
};

export const userAPI = {
    getUserProfile: (userId: number) =>
        api.get(`/${userId}/profile`),
    getUserByUsername: (username: string) =>
        api.get(`/username/${username}`),
    getCurrentUser: () =>
        api.get('/user/me'),
};

export const monitorAPI = {
    getStats: () =>
        api.get('/monitor/stats'),
};
