// CORE TYPES
// Definice typů sítí
export type NetworkType = 'facebook' | 'twitter' | 'mastodon' | 'bluesky' | 'threads';

// USER TYPES
export interface User {
    id: number;
    username: string;
    displayname: string;
}

// NETWORK TYPES
export interface NetworkInfo {
    id: number;
    name: string;
    displayName: string;
    isActive: boolean;
    color?: string;
    icon?: string;
    isOwned: boolean;
    networkId: number;
    networkName: string;
    networkType: NetworkType;
    owner: {
        id: number;
        username: string;
        displayname: string;
    };
    note?: string;
    permission: 'admin' | 'write' | 'read';
}

export interface NetworkPermission {
    granteeId: number;
    permission: 'read' | 'write';
    user?: User;
}

export interface NetworkToken {
    tokenName: string;
    token: string;
}

export interface OwnedNetwork {
    networkId: number;
    networkName: string;
    networkType: NetworkType;
    owner: {
        id: number;
        username: string;
        displayname: string;
    };
    note?: string;
    permission: 'read' | 'write' | 'admin';
}

// POST TYPES
export interface PostCardData {
    postId: number;
    creator: {
        id: number;
        username: string;
        displayname: string;
    };
    createdAt: string;
    firstContent?: string;
    contents?: {
        contentId: number;
        content: string;
        postDate: string;
        actualPostDate: string;
        networkPostId: string;
    }[];
    attachments?: {
        id: number;
        fileName: string;
    }[];
    status?: string;
}

export interface PostCardPermissions {
    canEdit: boolean;
    canDelete: boolean;
}

export interface PostContent {
    id?: number;
    postId: number;
    networkId: number;
    content: string;
    scheduledDate?: string;
    status: 'draft' | 'published' | 'scheduled';
}

export interface PostDetailedListItem {
    postId: number;
    creator: {
        id: number;
        username: string;
        displayname: string;
    };
    contents: {
        id: number;
        postId: number;
        content: string;
        linkedNetworks: number[];
        canEdit: boolean;
    }[];
    attachments: {
        id: number;
        postId: number;
        fileName: string;
        linkedNetworks: number[];
    }[];
    editors: PostEditor[];
    scheduledTimes: {
        networkId: number;
        contentId: number;
        postDate: string;
        actualPostDate: string | null;
        networkPostId: string | null;
    }[];
}

export interface PostDetailedListResponse {
    posts: PostDetailedListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PostEditor {
    userId: number;
    username: string;
}

export interface PostFile {
    id: number;
    fileName: string;
    fileSize: number;
    fileType: string;
    url?: string;
    postId: number;
}

export interface PostLinkedAttachment {
    attachmentId: number;
    networkId: number;
}

export interface PostLinkedContent {
    contentId: number;
    networkId: number;
}

// API RESPONSE TYPES
export interface CreateContentResponse {
    contentId: number;
    id?: number; // alias pro contentId
    success?: boolean;
    message?: string;
}

export interface CreatePostResponse {
    postId: number;
    success?: boolean;
    message?: string;
}

export interface UploadFileResponse {
    fileId: number;
    id?: number; // alias pro fileId
    fileName: string;
    fileUrl?: string;
    postId: number;
    success?: boolean;
    message?: string;
}

// UTILITY TYPES
export interface FileUpload {
    file: File;
    uploading: boolean;
    error?: string;
}

// MONITORING TYPES
export type MetricType = 'likes' | 'shares' | 'comments' | 'reposts' | 'views' | 'reach' | 'impressions' | 'engagement' | 'clickThroughRate';

export interface NetworkMetrics {
    networkId: number;
    networkType: NetworkType;
    availableMetrics: MetricType[];
}

export interface MetricDataPoint {
    timestamp: string;
    likes?: number;
    shares?: number;
    comments?: number;
    reposts?: number;
    views?: number;
    reach?: number;
    impressions?: number;
    engagement?: number;
    clickThroughRate?: number;
}

export interface NetworkGraphData {
    networkId: number;
    networkType: NetworkType;
    data: MetricDataPoint[];
}

export interface GraphDataResponse {
    networks: NetworkGraphData[];
}

// Typy pro aktuální metriky
export interface CurrentMetricDataPoint {
    timestamp: string;
    likes?: number;
    shares?: number;
    comments?: number;
    reposts?: number;
    views?: number;
    reach?: number;
    impressions?: number;
    engagement?: number;
    clickThroughRate?: number;
    reactions?: Record<string, number>;
    customMetrics?: Record<string, string>;
    [key: string]: any; // Pro další vlastnosti
}

export interface NetworkCurrentMetrics {
    networkId: number;
    networkType: NetworkType;
    data: CurrentMetricDataPoint;
}

export interface MonitorStats {
  unplannedPosts: number;
  scheduledPosts: number;
  nextScheduledDate: string | null;
  monitoredPosts: number;
}
