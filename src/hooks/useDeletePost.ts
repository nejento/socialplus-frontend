import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { postsAPI } from '../services/api';

interface UseDeletePostOptions {
  onSuccess?: (postId: number) => void;
  onError?: (error: any, postId: number) => void;
  showModal?: boolean;
}

export const useDeletePost = (options: UseDeletePostOptions = {}) => {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: number | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    postId: null,
    isDeleting: false,
  });

  const toast = useToast();
  const { onSuccess, onError, showModal = true } = options;

  const openDeleteModal = (postId: number) => {
    if (showModal) {
      setDeleteModal({
        isOpen: true,
        postId,
        isDeleting: false,
      });
    } else {
      // Pokud nechceme modal, rovnou smažeme
      confirmDelete(postId);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      postId: null,
      isDeleting: false,
    });
  };

  const confirmDelete = async (postId?: number) => {
    const targetPostId = postId || deleteModal.postId;
    if (!targetPostId) return;

    try {
      if (showModal) {
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      }

      await postsAPI.deletePost(targetPostId);

      toast({
        title: 'Příspěvek smazán',
        description: `Příspěvek #${targetPostId} byl úspěšně smazán.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess(targetPostId);
      }

      if (showModal) {
        closeDeleteModal();
      }
    } catch (error: any) {
      console.error('Chyba při mazání příspěvku:', error);

      const errorMessage = error.response?.data?.message || 'Nepodařilo se smazat příspěvek';

      toast({
        title: 'Chyba při mazání',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      if (onError) {
        onError(error, targetPostId);
      }

      if (showModal) {
        setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      }
    }
  };

  return {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  };
};
