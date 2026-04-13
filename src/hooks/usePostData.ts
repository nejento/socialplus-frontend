import React, { useState, useEffect, useCallback } from 'react';
import { postsAPI, userAPI } from '../services/api';
import { toaster } from '../components/ui/toaster';
import {
  PostDetailedListItem,
  PostEditor,
  NetworkInfo,
  OwnedNetwork,
  PostLinkedContent,
  PostLinkedAttachment,
  PostFile
} from '@/types';

// Helper function to get network styling based on type
const getNetworkStyling = (networkType: string) => {
  const stylingMap: Record<string, { color: string; icon?: string }> = {
    facebook: { color: 'blue' },
    twitter: { color: 'blue' },
    mastodon: { color: 'purple' },
    bluesky: { color: 'blue' },
    threads: { color: 'gray' },
  };

  return stylingMap[networkType.toLowerCase()] || { color: 'gray' };
};

export interface UsePostDataReturn {
  // Základní post data
  postEditors: PostEditor[];
  isOwner: boolean;
  currentUserId: number | null;

  // Networks data
  availableNetworks: NetworkInfo[];
  selectedNetworksByContent: Map<number, number[]>;
  selectedNetworksByAttachment: Map<number, number[]>;
  loadingNetworks: boolean;

  // Files data
  postFiles: PostFile[];

  // Schedule data
  schedulingDates: Map<number, string>;
  existingSchedules: Map<number, string>;
  sentNetworks: Set<number>;

  // Loading functions
  loadAllPostData: () => Promise<void>;
  isLoading: boolean;

  // Settery pro externí updaty
  setPostEditors: React.Dispatch<React.SetStateAction<PostEditor[]>>;
  setSelectedNetworksByContent: React.Dispatch<React.SetStateAction<Map<number, number[]>>>;
  setSelectedNetworksByAttachment: React.Dispatch<React.SetStateAction<Map<number, number[]>>>;
  setPostFiles: React.Dispatch<React.SetStateAction<PostFile[]>>;
  setSchedulingDates: React.Dispatch<React.SetStateAction<Map<number, string>>>;
  setExistingSchedules: React.Dispatch<React.SetStateAction<Map<number, string>>>;
  setSentNetworks: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export const usePostData = (currentPostId: number | null, id?: string): UsePostDataReturn => {

  // State
  const [postEditors, setPostEditors] = useState<PostEditor[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [availableNetworks, setAvailableNetworks] = useState<NetworkInfo[]>([]);
  const [selectedNetworksByContent, setSelectedNetworksByContent] = useState<Map<number, number[]>>(new Map());
  const [selectedNetworksByAttachment, setSelectedNetworksByAttachment] = useState<Map<number, number[]>>(new Map());
  const [loadingNetworks, setLoadingNetworks] = useState(false);

  const [postFiles, setPostFiles] = useState<PostFile[]>([]);

  const [schedulingDates, setSchedulingDates] = useState<Map<number, string>>(new Map());
  const [existingSchedules, setExistingSchedules] = useState<Map<number, string>>(new Map());
  const [sentNetworks, setSentNetworks] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(false);

  // Load current user - pouze jednou při mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        setCurrentUserId(response.data.id);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Konsolidovaná funkce pro načtení všech dat příspěvku
  const loadAllPostData = useCallback(async () => {
    if (!currentPostId || !currentUserId) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadingNetworks(true);

      console.log(`Loading data for post ${currentPostId}`);

      // Paralelně načteme všechna potřebná data s individuální error handling
      const results = await Promise.allSettled([
        postsAPI.getPost(currentPostId),
        postsAPI.getPostAvailableNetworks(currentPostId),
        postsAPI.getPostLinkedContents(currentPostId),
        postsAPI.getPostLinkedAttachments(currentPostId),
        postsAPI.getPostFiles(currentPostId)
      ]);

      // Zpracujeme výsledky s detailním error reporting
      const [postResult, networksResult, linkedContentsResult, linkedAttachmentsResult, filesResult] = results;

      // Základní data příspěvku
      if (postResult.status === 'fulfilled') {
        const postData = postResult.value.data as PostDetailedListItem;
        setPostEditors(postData.editors);
        setIsOwner(postData.creator.id === currentUserId);

        // Zpracování plánování a odeslaných sítí
        if (postData.scheduledTimes && postData.scheduledTimes.length > 0) {
          const schedulesMap = new Map<number, string>();
          const sentNetworksSet = new Set<number>();

          postData.scheduledTimes.forEach(schedule => {
            if (schedule.actualPostDate === null || schedule.actualPostDate === undefined) {
              if (schedule.postDate) {
                schedulesMap.set(schedule.networkId, schedule.postDate);
              }
            } else {
              sentNetworksSet.add(schedule.networkId);
            }
          });

          setExistingSchedules(schedulesMap);
          setSchedulingDates(new Map(schedulesMap));
          setSentNetworks(sentNetworksSet);
        } else {
          setExistingSchedules(new Map());
          setSchedulingDates(new Map());
          setSentNetworks(new Set());
        }
      } else {
        console.error('Failed to load post data:', postResult.reason);
        throw new Error('Failed to load post data');
      }

      // Dostupné sítě
      if (networksResult.status === 'fulfilled') {
        const availableNetworksData = networksResult.value.data as OwnedNetwork[];
        const availableNetworksTemp: NetworkInfo[] = availableNetworksData.map(network => {
          const styling = getNetworkStyling(network.networkType);
          return {
            id: network.networkId,
            name: network.networkName,
            displayName: network.networkName,
            isActive: true,
            color: styling.color,
            icon: styling.icon,
            networkId: network.networkId,
            networkName: network.networkName,
            networkType: network.networkType,
            owner: network.owner,
            note: network.note,
            permission: network.permission,
            isOwned: network.owner.id === currentUserId
          };
        });

        setAvailableNetworks(availableNetworksTemp);
      } else {
        console.error('Failed to load available networks:', networksResult.reason);
        // Pokračujeme i bez sítí
        setAvailableNetworks([]);
      }

      // Propojené obsahy
      if (linkedContentsResult.status === 'fulfilled') {
        const linkedContents = linkedContentsResult.value.data as PostLinkedContent[];
        const networksByContent = new Map<number, number[]>();
        linkedContents.forEach(linked => {
          const currentNetworks = networksByContent.get(linked.contentId) || [];
          networksByContent.set(linked.contentId, [...currentNetworks, linked.networkId]);
        });
        setSelectedNetworksByContent(networksByContent);
      } else {
        console.error('Failed to load linked contents:', linkedContentsResult.reason);
        setSelectedNetworksByContent(new Map());
      }

      // Propojené přílohy
      if (linkedAttachmentsResult.status === 'fulfilled') {
        const linkedAttachments = linkedAttachmentsResult.value.data as PostLinkedAttachment[];
        const networksByAttachment = new Map<number, number[]>();
        linkedAttachments.forEach(linked => {
          const currentNetworks = networksByAttachment.get(linked.attachmentId) || [];
          networksByAttachment.set(linked.attachmentId, [...currentNetworks, linked.networkId]);
        });
        setSelectedNetworksByAttachment(networksByAttachment);
      } else {
        console.error('Failed to load linked attachments:', linkedAttachmentsResult.reason);
        setSelectedNetworksByAttachment(new Map());
      }

      // Soubory
      if (filesResult.status === 'fulfilled') {
        setPostFiles(filesResult.value.data);
      } else {
        console.error('Failed to load post files:', filesResult.reason);
        setPostFiles([]);
      }

      console.log('All post data loaded successfully');

    } catch (error) {
      console.error('Chyba při načítání dat příspěvku:', error);
      if (id) {
        toaster.create({
          title: 'Chyba při načítání',
          description: 'Nepodařilo se načíst informace o příspěvku',
          type: 'error',
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
      setLoadingNetworks(false);
    }
  }, [currentPostId, currentUserId, id]);

  // Načtení dat při změně závislostí - pouze jednou
  useEffect(() => {
    if (currentPostId && currentUserId) {
      loadAllPostData();
    }
  }, [currentPostId, currentUserId, loadAllPostData]);

  return {
    postEditors,
    isOwner,
    currentUserId,
    availableNetworks,
    selectedNetworksByContent,
    selectedNetworksByAttachment,
    loadingNetworks,
    postFiles,
    schedulingDates,
    existingSchedules,
    sentNetworks,
    loadAllPostData,
    isLoading,
    setPostEditors,
    setSelectedNetworksByContent,
    setSelectedNetworksByAttachment,
    setPostFiles,
    setSchedulingDates,
    setExistingSchedules,
    setSentNetworks,
  };
};
