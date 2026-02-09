import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Textarea,
  Text,
  IconButton,
  useToast,
  useColorModeValue,
  Heading,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import { useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import {
  PostContent,
  CreatePostResponse,
  CreateContentResponse,
  FileUpload,
  UploadFileResponse
} from '@/types';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import NetworkSelector from '../components/NetworkSelector';
import UserSelector from '../components/UserSelector';
import { SaveStatusIndicator } from '../components/SaveStatusIndicator';
import { AttachmentsSection } from '../components/AttachmentsSection';
import { SchedulingSection } from '../components/SchedulingSection';
import { NetworkSelectionModal } from '../components/NetworkSelectionModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { usePostData } from '../hooks/usePostData';
import debounce from 'lodash/debounce';
import { formatFileSize } from '../utils/fileUtils';

// Globální limit znaků pro všechny příspěvky
const MAX_CHARS = 63206;

// Limity znaků pro jednotlivé sociální sítě
const NETWORK_CHAR_LIMITS: Record<string, number> = {
  'twitter': 280,
  'bluesky': 300,
  'threads': 500,
  'mastodon': 500,
  'instagram': 2200,
  'facebook': 63206
};

interface PostInput {
  socialNetwork: string;
  text: string;
  contentId?: number; // ID obsahu v databázi
  saveStatus?: 'saved' | 'saving' | 'error'; // Status uložení
  lastSaved?: Date; // Čas posledního uložení
}

const PostEditorPage = () => {
  const { id } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

  const [currentPostId, setCurrentPostId] = useState<number | null>(id ? parseInt(id) : null);
  const [inputs, setInputs] = useState<PostInput[]>([{
    socialNetwork: 'facebook',
    text: '',
    saveStatus: undefined,
    contentId: undefined
  }]);

  // Stavy pro nahrávání souborů
  const [uploadingFiles, setUploadingFiles] = useState<FileUpload[]>([]);
  const [maxFileSize, setMaxFileSize] = useState<number>(5 * 1024 * 1024); // Default 5MB

  // Stavy pro modal okamžitého odeslání
  const [selectedNetworksForSend, setSelectedNetworksForSend] = useState<number[]>([]);
  const [pendingAction, setPendingAction] = useState<'sendAll' | 'sendSelected' | null>(null);
  const [confirmAction, setConfirmAction] = useState<'sendAll' | 'sendSelected' | null>(null);

  // Použití custom hooku pro správu dat příspěvku
  const {
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
    setPostEditors,
    setSelectedNetworksByContent,
    setSelectedNetworksByAttachment,
    setPostFiles,
    setSchedulingDates,
    setExistingSchedules,
    setSentNetworks,
  } = usePostData(currentPostId, id);

  // Funkce pro získání minimálního limitu znaků na základě propojených sítí
  const getCharacterLimit = useCallback((contentId?: number) => {
    if (!contentId) return MAX_CHARS;

    const linkedNetworkIds = selectedNetworksByContent.get(contentId) || [];
    if (linkedNetworkIds.length === 0) return MAX_CHARS;

    // Najdeme minimální limit mezi propojenými sítěmi
    let minLimit = MAX_CHARS;
    linkedNetworkIds.forEach(networkId => {
      const network = availableNetworks.find(n => n.id === networkId);
      if (network) {
        const limit = NETWORK_CHAR_LIMITS[network.networkType];
        if (limit && limit < minLimit) {
          minLimit = limit;
        }
      }
    });

    return minLimit;
  }, [selectedNetworksByContent, availableNetworks]);

  // Funkce pro získání počtu překračujících znaků
  const getExcessCharacters = useCallback((text: string, limit: number) => {
    return Math.max(0, text.length - limit);
  }, []);

  // Mutation pro vytvoření nového příspěvku
  const createPostMutation = useMutation({
    mutationFn: () => postsAPI.createPost(),
    onSuccess: (response) => {
      const data = response.data as CreatePostResponse;
      setCurrentPostId(data.postId);
      // Aktualizujeme URL s novým ID ale bez přesměrování
      window.history.replaceState(null, '', `/editor/${data.postId}`);
      toast({
        title: 'Příspěvek vytvořen',
        description: `Nový příspěvek #${data.postId} byl vytvořen`,
        status: 'success',
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při vytváření příspěvku',
        description: 'Nepodařilo se vytvořit nový příspěvek',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Mutation pro vytvoření nového obsahu
  const createContentMutation = useMutation({
    mutationFn: ({ postId, content, inputIndex  : _inputIndex }: { postId: number; content: string; inputIndex?: number }) =>
      postsAPI.createContent(postId, content),
    onSuccess: (response, variables) => {
      const data = response.data as CreateContentResponse;

      if (typeof variables.inputIndex === 'number') {
        // Pokud máme index, aktualizujeme konkrétní input
        setInputs(prev => prev.map((input, idx) =>
          idx === variables.inputIndex
            ? { ...input, contentId: data.id, saveStatus: 'saved', lastSaved: new Date() }
            : input
        ));
      } else {
        // Fallback pro starý způsob (první textové pole)
        setInputs(prev => prev.map(input =>
          input.text === variables.content && !input.contentId
            ? { ...input, contentId: data.id, saveStatus: 'saved', lastSaved: new Date() }
            : input
        ));
      }
    },
    onError: (_error, variables) => {
      if (typeof variables.inputIndex === 'number') {
        // Pokud máme index, označíme konkrétní input jako chybový
        setInputs(prev => prev.map((input, idx) =>
          idx === variables.inputIndex
            ? { ...input, saveStatus: 'error' }
            : input
        ));
      } else {
        // Fallback pro starý způsob
        setInputs(prev => prev.map(input =>
          input.text === variables.content && !input.contentId
            ? { ...input, saveStatus: 'error' }
            : input
        ));
      }
    }
  });

  // Mutation pro úpravu obsahu
  const updateContentMutation = useMutation({
    mutationFn: ({ postId, contentId, content }: { postId: number; contentId: number; content: string }) =>
      postsAPI.updateContent(postId, contentId, content),
    onSuccess: (_response, variables) => {
      setInputs(prev => prev.map(input =>
        input.contentId === variables.contentId
          ? { ...input, saveStatus: 'saved', lastSaved: new Date() }
          : input
      ));
    },
    onError: (_error, variables) => {
      setInputs(prev => prev.map(input =>
        input.contentId === variables.contentId
          ? { ...input, saveStatus: 'error' }
          : input
      ));
    }
  });

  // Mutation pro smazání obsahu
  const deleteContentMutation = useMutation({
    mutationFn: ({ postId, contentId }: { postId: number; contentId: number }) =>
      postsAPI.deleteContent(postId, contentId),
    onSuccess: () => {
      toast({
        title: 'Obsah smazán',
        status: 'info',
        duration: 2000,
      });
    }
  });

  // Mutations pro propojování obsahu se sociálními sítěmi
  const linkContentMutation = useMutation({
    mutationFn: ({ postId, contentId, networkId }: { postId: number; contentId: number; networkId: number }) =>
      postsAPI.linkContentToNetwork(postId, contentId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Síť připojena',
        description: 'Obsah byl úspěšně připojen k sociální síti',
        status: 'success',
        duration: 2000,
      });

      // Aktualizujeme stav selected networks
      setSelectedNetworksByContent(prev => {
        const newMap = new Map(prev);
        const currentNetworks = newMap.get(variables.contentId) || [];
        if (!currentNetworks.includes(variables.networkId)) {
          newMap.set(variables.contentId, [...currentNetworks, variables.networkId]);
        }
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při připojování',
        description: 'Nepodařilo se připojit obsah k sociální síti',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const unlinkContentMutation = useMutation({
    mutationFn: ({ postId, contentId, networkId }: { postId: number; contentId: number; networkId: number }) =>
      postsAPI.unlinkContentFromNetwork(postId, contentId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Síť odpojena',
        description: 'Obsah byl úspěšně odpojen od sociální sítě',
        status: 'info',
        duration: 2000,
      });

      // Aktualizujeme stav selected networks
      setSelectedNetworksByContent(prev => {
        const newMap = new Map(prev);
        const currentNetworks = newMap.get(variables.contentId) || [];
        newMap.set(variables.contentId, currentNetworks.filter(id => id !== variables.networkId));
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při odpojování',
        description: 'Nepodařilo se odpojit obsah od sociální síti',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Mutations pro správu souborů
  const uploadFileMutation = useMutation({
    mutationFn: ({ postId, file }: { postId: number; file: File }) =>
      postsAPI.uploadFile(postId, file),
    onSuccess: (response, variables) => {
      const data = response.data as UploadFileResponse;
      
      // Odebereme soubor z uploading stavu
      setUploadingFiles(prev => 
        prev.filter(upload => upload.file !== variables.file)
      );
      
      // Aktualizujeme seznam souborů
      setPostFiles(prev => [...prev, {
        id: data.fileId || data.id!,
        postId: data.postId,
        fileName: data.fileName,
        fileSize: 0, // Default value protože není v response
        fileType: '', // Default value protože není v response
        url: data.fileUrl
      }]);

      toast({
        title: 'Soubor nahrán',
        description: `Soubor ${data.fileName} byl úspěšně nahrán`,
        status: 'success',
        duration: 3000,
      });
    },
    onError: (_error, variables) => {
      // Označíme soubor jako chybový
      setUploadingFiles(prev => 
        prev.map(upload => 
          upload.file === variables.file 
            ? { ...upload, uploading: false, error: 'Chyba při nahrávání' }
            : upload
        )
      );

      toast({
        title: 'Chyba při nahrávání',
        description: 'Nepodařilo se nahrát soubor',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const removeFileMutation = useMutation({
    mutationFn: ({ postId, attachmentId }: { postId: number; attachmentId: number }) =>
      postsAPI.removeFile(postId, attachmentId),
    onSuccess: (_response, variables) => {
      // Odebereme soubor ze seznamu
      setPostFiles(prev => 
        prev.filter(file => file.id !== variables.attachmentId)
      );

      toast({
        title: 'Soubor smazán',
        description: 'Soubor byl úspěšně smazán',
        status: 'info',
        duration: 2000,
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při mazání',
        description: 'Nepodařilo se smazat soubor',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Mutations pro propojování souborů se sociálními sítěmi
  const linkAttachmentMutation = useMutation({
    mutationFn: ({ postId, attachmentId, networkId }: { postId: number; attachmentId: number; networkId: number }) =>
      postsAPI.linkAttachmentToNetwork(postId, attachmentId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Síť připojena k souboru',
        description: 'Soubor byl úspěšně připojen k sociální síti',
        status: 'success',
        duration: 2000,
      });

      // Aktualizujeme stav selected networks pro attachment
      setSelectedNetworksByAttachment(prev => {
        const newMap = new Map(prev);
        const currentNetworks = newMap.get(variables.attachmentId) || [];
        if (!currentNetworks.includes(variables.networkId)) {
          newMap.set(variables.attachmentId, [...currentNetworks, variables.networkId]);
        }
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při připojování souboru',
        description: 'Nepodařilo se připojit soubor k sociální síti',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const unlinkAttachmentMutation = useMutation({
    mutationFn: ({ postId, attachmentId, networkId }: { postId: number; attachmentId: number; networkId: number }) =>
      postsAPI.unlinkAttachmentFromNetwork(postId, attachmentId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Síť odpojena od souboru',
        description: 'Soubor byl úspěšně odpojen od sociální sítě',
        status: 'info',
        duration: 2000,
      });

      // Aktualizujeme stav selected networks pro attachment
      setSelectedNetworksByAttachment(prev => {
        const newMap = new Map(prev);
        const currentNetworks = newMap.get(variables.attachmentId) || [];
        newMap.set(variables.attachmentId, currentNetworks.filter(id => id !== variables.networkId));
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při odpojování souboru',
        description: 'Nepodařilo se odpojit soubor od sociální síti',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Mutations pro správu editorů příspěvků
  const addEditorMutation = useMutation({
    mutationFn: ({ postId, userId }: { postId: number; userId: number }) =>
      postsAPI.addEditor(postId, userId),
    onSuccess: () => {
      toast({
        title: 'Editor přidán',
        description: 'Uživatel byl úspěšně přidán jako editor příspěvku',
        status: 'success',
        duration: 3000,
      });

      // Znovu načteme data o příspěvku pro aktualizaci seznamu editorů
      if (currentPostId) {
        loadAllPostData();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Chyba při přidávání editora',
        description: error.response?.data?.message || 'Nepodařilo se přidat editora',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const removeEditorMutation = useMutation({
    mutationFn: ({ postId, userId }: { postId: number; userId: number }) =>
      postsAPI.removeEditor(postId, userId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Editor odebrán',
        description: 'Uživatel byl úspěšně odebrán ze seznamu editorů',
        status: 'info',
        duration: 3000,
      });

      // Aktualizujeme seznam editorů
      setPostEditors(prev => prev.filter(editor => editor.userId !== variables.userId));
    },
    onError: (error: any) => {
      toast({
        title: 'Chyba při odebírání editora',
        description: error.response?.data?.message || 'Nepodařilo se odebrat editora',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Funkce pro přidání editora
  const handleAddEditor = useCallback(async (userId: number, _username: string) => {
    if (!currentPostId) return;

    try {
      await addEditorMutation.mutateAsync({
        postId: currentPostId,
        userId: userId
      });
    } catch (error: any) {
      toast({
        title: 'Chyba při přidávání editora',
        description: error?.response?.data?.message || 'Nepodařilo se přidat editora',
        status: 'error',
        duration: 3000,
      });
    }
  }, [currentPostId, addEditorMutation, toast]);

  // Funkce pro odebrání editora
  const handleRemoveEditor = useCallback(async (userId: number) => {
    if (!currentPostId) return;

    if (!confirm('Opravdu chcete odebrat tohoto editora?')) return;

    try {
      await removeEditorMutation.mutateAsync({
        postId: currentPostId,
        userId: userId
      });
    } catch (error: any) {
      toast({
        title: 'Chyba při odebírání editora',
        description: error?.response?.data?.message || 'Nepodařilo se odebrat editora',
        status: 'error',
        duration: 3000,
      });
    }
  }, [currentPostId, removeEditorMutation, toast]);

  // Funkce pro zpracování výběru sociálních sítí
  const handleNetworkToggle = useCallback(async (inputIndex: number, networkId: number, isSelected: boolean) => {
    const input = inputs[inputIndex];

    if (!currentPostId || !input.contentId) {
      toast({
        title: 'Chyba',
        description: 'Nejprve musí být obsah uložen',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      if (isSelected) {
        // Připojení k síti
        await linkContentMutation.mutateAsync({
          postId: currentPostId,
          contentId: input.contentId,
          networkId: networkId
        });
      } else {
        // Odpojení od sítě
        await unlinkContentMutation.mutateAsync({
          postId: currentPostId,
          contentId: input.contentId,
          networkId: networkId
        });
      }
    } catch (error) {
      console.error('Chyba při změně připojení k síti:', error);
    }
  }, [inputs, currentPostId, linkContentMutation, unlinkContentMutation, toast]);

  // Funkce pro zpracování výběru sociálních sítí pro soubory
  const handleAttachmentNetworkToggle = useCallback(async (attachmentId: number, networkId: number, isSelected: boolean) => {
    if (!currentPostId) {
      toast({
        title: 'Chyba',
        description: 'Post ID není k dispozici',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      if (isSelected) {
        // Připojení souboru k síti
        await linkAttachmentMutation.mutateAsync({
          postId: currentPostId,
          attachmentId: attachmentId,
          networkId: networkId
        });
      } else {
        // Odpojení souboru od sítě
        await unlinkAttachmentMutation.mutateAsync({
          postId: currentPostId,
          attachmentId: attachmentId,
          networkId: networkId
        });
      }
    } catch (error) {
      console.error('Chyba při změně připojení souboru k síti:', error);
    }
  }, [currentPostId, linkAttachmentMutation, unlinkAttachmentMutation, toast]);


  // Načtení maximální velikosti souboru při načtení komponenty
  useEffect(() => {
    const loadMaxFileSize = async () => {
      try {
        const response = await postsAPI.getAttachmentSize();
        const data = response.data as { maxFileSize: number };
        setMaxFileSize(data.maxFileSize);
      } catch (error) {
        console.error('Nepodařilo se načíst maximální velikost souboru:', error);
        // Ponecháme výchozí hodnotu 5MB
      }
    };

    loadMaxFileSize();
  }, []);

  // Načítání dat pro edit mode existujícího příspěvku
  useEffect(() => {
    const loadPostContents = async () => {
      if (!currentPostId || !currentUserId) return;

      try {
        // Načteme obsahy příspěvku
        const contentsRes = await postsAPI.getPostContents(currentPostId);
        const contents = contentsRes.data as PostContent[];

        if (contents.length > 0) {
          // Vytvoříme inputs z načtených obsahů
          const loadedInputs: PostInput[] = contents.map((content) => ({
            socialNetwork: 'facebook', // Default hodnota, může se upravit podle potřeby
            text: content.content,
            contentId: content.id,
            saveStatus: 'saved',
            lastSaved: new Date()
          }));

          setInputs(loadedInputs);
        }

      } catch (error) {
        // Pouze zobrazíme toast pokud se jedná o existující příspěvek (ne nový)
        if (id) {
          toast({
            title: 'Chyba při načítání',
            description: 'Nepodařilo se načíst obsah příspěvku',
            status: 'error',
            duration: 3000,
          });
        }
      }
    };

    loadPostContents();
  }, [currentPostId, currentUserId, id, toast]);


  // Debounced funkce pro auto-save - používáme useRef pro aktuální stav
  const inputsRef = useRef(inputs);
  const currentPostIdRef = useRef(currentPostId);
  const updateContentMutationRef = useRef(updateContentMutation);
  const createContentMutationRef = useRef(createContentMutation);

  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  useEffect(() => {
    currentPostIdRef.current = currentPostId;
  }, [currentPostId]);

  useEffect(() => {
    updateContentMutationRef.current = updateContentMutation;
  }, [updateContentMutation]);

  useEffect(() => {
    createContentMutationRef.current = createContentMutation;
  }, [createContentMutation]);

  // Vytvoříme debounced funkci pouze jednou
  const debouncedSave = useCallback(
    debounce(async (inputIndex: number, text: string) => {
      const postId = currentPostIdRef.current;
      if (!postId || !text.trim()) return;

      // Použijeme ref pro získání aktuálního stavu
      const currentInputs = inputsRef.current;
      const currentInput = currentInputs[inputIndex];

      // Označíme jako ukládající
      setInputs(prev => prev.map((inp, idx) =>
        idx === inputIndex ? { ...inp, saveStatus: 'saving' } : inp
      ));

      try {
        if (currentInput?.contentId) {
          // Úprava existujícího obsahu - vždy PUT pokud máme contentId
          await updateContentMutationRef.current.mutateAsync({
            postId: postId,
            contentId: currentInput.contentId,
            content: text
          });
        } else {
          // Vytvoření nového obsahu - pouze pro první textové pole (index 0)
          if (inputIndex === 0) {
            await createContentMutationRef.current.mutateAsync({
              postId: postId,
              content: text,
              inputIndex: inputIndex
            });
          }
        }
      } catch (error) {
        setInputs(prev => prev.map((inp, idx) =>
          idx === inputIndex ? { ...inp, saveStatus: 'error' } : inp
        ));
      }
    }, 1500), // 1.5 sekundy debounce
    [] // Prázdné dependencies - funkce se vytvoří pouze jednou
  );

  // Funkce pro změnu textu
  const handleTextChange = useCallback((index: number, value: string) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], text: value };
      return newInputs;
    });

    // Pokud je post vytvořen, spustíme auto-save
    if (currentPostIdRef.current && value.trim()) {
      debouncedSave(index, value);
    }
  }, [debouncedSave]);

  // Funkce pro vytvoření příspěvku při prvním zadání textu
  const ensurePostExists = useCallback(async () => {
    if (!currentPostId && !createPostMutation.isPending) {
      await createPostMutation.mutateAsync();
    }
  }, [currentPostId, createPostMutation]);

  // Wrapper pro handleTextChange který zajistí vytvoření příspěvku
  const handleTextChangeWithPostCreation = useCallback(async (index: number, value: string) => {
    // Pokud není post vytvořen a uživatel začal psát, vytvoříme post
    if (!currentPostId && value.trim() && !createPostMutation.isPending) {
      await ensurePostExists();
    }
    handleTextChange(index, value);
  }, [currentPostId, createPostMutation.isPending, ensurePostExists, handleTextChange]);

  // Funkce pro vytvoření nového textového pole s okamžitým POST requestem
  const handleAddNewInput = useCallback(async () => {
    if (!currentPostId) return;

    // Nejprve přidáme nový input s loading stavem
    const newInput: PostInput = {
      socialNetwork: 'facebook', // Default hodnota
      text: '',
      saveStatus: 'saving',
      contentId: undefined
    };

    const newInputIndex = inputs.length; // Index nového inputu
    setInputs(prev => [...prev, newInput]);

    try {
      // Okamžitě zavoláme POST pro vytvoření prázdného obsahu
      await createContentMutation.mutateAsync({
        postId: currentPostId,
        content: '', // Prázdný obsah
        inputIndex: newInputIndex
      });

    } catch (error) {
      // Při chybě označíme input jako chybový
      setInputs(prev => prev.map((input, idx) =>
        idx === newInputIndex
          ? { ...input, saveStatus: 'error' }
          : input
      ));

      toast({
        title: 'Chyba při vytváření pole',
        description: 'Nepodařilo se vytvořit nové textové pole',
        status: 'error',
        duration: 3000,
      });
    }
  }, [inputs, currentPostId, createContentMutation, toast]);

  // Funkce pro odebrání textového pole
  const handleRemoveInput = useCallback(async (index: number) => {
    const input = inputs[index];

    // Pokud má input contentId, smažeme obsah ze serveru
    if (input.contentId && currentPostId) {
      try {
        await deleteContentMutation.mutateAsync({
          postId: currentPostId,
          contentId: input.contentId
        });
      } catch (error) {
        toast({
          title: 'Chyba při mazání',
          description: 'Nepodařilo se smazat obsah',
          status: 'error',
          duration: 3000,
        });
        return; // Nezmažeme input pokud se nepodařilo smazat ze serveru
      }
    }

    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  }, [inputs, currentPostId, deleteContentMutation, toast]);

  // Funkce pro nahrávání souborů
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentPostId) {
      toast({
        title: 'Chyba',
        description: 'Nejprve musí být příspěvek vytvořen',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Kontrola velikosti souborů (dynamický limit)
    const oversizedFiles = files.filter(file => file.size > maxFileSize);

    if (oversizedFiles.length > 0) {
      const formattedLimit = formatFileSize(maxFileSize);
      toast({
        title: 'Soubory příliš velké',
        description: `Některé soubory překračují limit ${formattedLimit}: ${oversizedFiles.map(f => f.name).join(', ')}`,
        status: 'error',
        duration: 5000,
      });
      return;
    }

    // Přidáme soubory do uploading stavu
    const newUploadingFiles: FileUpload[] = files.map(file => ({
      file,
      uploading: true,
      error: undefined
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Nahrání souborů jeden po druhém
    for (const file of files) {
      try {
        await uploadFileMutation.mutateAsync({
          postId: currentPostId,
          file: file
        });
      } catch (error) {
        console.error('Chyba při nahrávání souboru:', file.name, error);
        // Error handling je už v mutation
      }
    }

    // Vyčistíme input
    event.target.value = '';
  }, [currentPostId, maxFileSize, uploadFileMutation, toast]);


  // Mutations pro plánování příspěvků
  const schedulePostMutation = useMutation({
    mutationFn: ({ postId, networkId, postDate }: { postId: number; networkId: number; postDate: string }) =>
      postsAPI.schedulePost(postId, networkId, postDate),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Plánování nastaveno',
        description: 'Příspěvek byl úspěšně naplánován',
        status: 'success',
        duration: 2000,
      });

      // Aktualizujeme existující plánování
      setExistingSchedules(prev => {
        const newMap = new Map(prev);
        newMap.set(variables.networkId, variables.postDate);
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při plánování',
        description: 'Nepodařilo se naplánovat příspěvek',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const unschedulePostMutation = useMutation({
    mutationFn: ({ postId, networkId }: { postId: number; networkId: number }) =>
      postsAPI.unschedulePost(postId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Plánování zrušeno',
        description: 'Plánování příspěvku bylo úspěšně zrušeno',
        status: 'info',
        duration: 2000,
      });

      // Odebereme z existujícího plánování
      setExistingSchedules(prev => {
        const newMap = new Map(prev);
        newMap.delete(variables.networkId);
        return newMap;
      });

      // Odebereme také z aktuálního plánování
      setSchedulingDates(prev => {
        const newMap = new Map(prev);
        newMap.delete(variables.networkId);
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při rušení plánování',
        description: 'Nepodařilo se zrušit plánování příspěvku',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Mutations pro okamžité odeslání příspěvků
  const sendToAllNetworksMutation = useMutation({
    mutationFn: (postId: number) => postsAPI.sendToAllNetworks(postId),
    onSuccess: () => {
      toast({
        title: 'Příspěvek odeslán',
        description: 'Příspěvek byl úspěšně odeslán na všechny propojené sítě',
        status: 'success',
        duration: 3000,
      });

      // Aktualizujeme stav - všechny propojené sítě jsou nyní odeslané
      const linkedNetworks = getLinkedNetworks();
      setSentNetworks(prev => {
        const newSet = new Set(prev);
        linkedNetworks.forEach(network => newSet.add(network.id));
        return newSet;
      });

      // Zrušíme všechna plánování
      setExistingSchedules(new Map());
      setSchedulingDates(new Map());
    },
    onError: () => {
      toast({
        title: 'Chyba při odesílání',
        description: 'Nepodařilo se odeslat příspěvek na všechny sítě',
        status: 'error',
        duration: 3000,
      });
    }
  });

  const sendToNetworkMutation = useMutation({
    mutationFn: ({ postId, networkId }: { postId: number; networkId: number }) =>
      postsAPI.sendToNetwork(postId, networkId),
    onSuccess: (_response, variables) => {
      toast({
        title: 'Příspěvek odeslán',
        description: 'Příspěvek byl úspěšně odeslán na vybranou síť',
        status: 'success',
        duration: 2000,
      });

      // Přidáme síť do odeslaných
      setSentNetworks(prev => new Set([...prev, variables.networkId]));

      // Odebereme plánování pro tuto síť
      setExistingSchedules(prev => {
        const newMap = new Map(prev);
        newMap.delete(variables.networkId);
        return newMap;
      });
      setSchedulingDates(prev => {
        const newMap = new Map(prev);
        newMap.delete(variables.networkId);
        return newMap;
      });
    },
    onError: () => {
      toast({
        title: 'Chyba při odesílání',
        description: 'Nepodařilo se odeslat příspěvek na vybranou síť',
        status: 'error',
        duration: 3000,
      });
    }
  });

  // Funkce pro práci s plánováním
  const getLinkedNetworks = useCallback(() => {
    const linkedNetworkIds = new Set<number>();

    // Získáme všechny sítě propojené s obsahy
    selectedNetworksByContent.forEach(networkIds => {
      networkIds.forEach(id => linkedNetworkIds.add(id));
    });

    // Získáme všechny sítě propojené s přílohami
    selectedNetworksByAttachment.forEach(networkIds => {
      networkIds.forEach(id => linkedNetworkIds.add(id));
    });

    return availableNetworks.filter(network => linkedNetworkIds.has(network.id));
  }, [availableNetworks, selectedNetworksByContent, selectedNetworksByAttachment]);

  // Funkce pro kontrolu oprávnění k plánování pro konkrétní síť
  const canScheduleOnNetwork = useCallback((networkId: number) => {
    if (!currentUserId) return false;

    // Kontrola, zda už nebyl příspěvek na tuto síť odeslán
    if (sentNetworks.has(networkId)) return false;

    // Majitel příspěvku může plánovat na všechny sítě (pokud nebyly odeslány)
    if (isOwner) return true;

    // Majitel konkrétní sítě může plánovat na svou síť (pokud nebyla odeslána)
    const network = availableNetworks.find(n => n.id === networkId);
    return network?.isOwned === true;
  }, [currentUserId, isOwner, availableNetworks, sentNetworks]);

  // Funkce pro kontrolu, zda uživatel může měnit plánování obecně
  const canManageScheduling = useCallback(() => {
    if (!currentUserId) return false;

    // Majitel příspěvku může vždy spravovat plánování
    if (isOwner) return true;

    // Nebo pokud je majitelem alespoň jedné propojené sítě
    const linkedNetworks = getLinkedNetworks();
    return linkedNetworks.some(network => network.isOwned);
  }, [currentUserId, isOwner, getLinkedNetworks]);

  // Funkce pro kontrolu oprávnění k odeslání příspěvku
  const canSendPost = useCallback(() => {
    if (!currentUserId || !currentPostId) return false;

    // Majitel příspěvku může vždy odesílat na všechny propojené sítě
    if (isOwner) return true;

    // Editor může odesílat pouze na sítě, které vlastní a které jsou propojené s contentem
    const linkedNetworks = getLinkedNetworks();
    return linkedNetworks.some(network => network.isOwned);
  }, [currentUserId, currentPostId, isOwner, getLinkedNetworks]);

  // Funkce pro získání sítí, na které může uživatel odeslat příspěvek
  const getAuthorizedNetworksForSending = useCallback(() => {
    if (!currentUserId) return [];

    const linkedNetworks = getLinkedNetworks();

    // Majitel příspěvku může odesílat na všechny propojené sítě
    if (isOwner) return linkedNetworks;

    // Editor může odesílat pouze na sítě, které vlastní
    return linkedNetworks.filter(network => network.isOwned);
  }, [currentUserId, isOwner, getLinkedNetworks]);

  // Funkce pro zavření editoru
  const handleClose = useCallback(() => {
    window.history.back();
  }, []);

  // Funkce pro zpracování změny data plánování
  const handleScheduleDateChange = useCallback((networkId: number, dateValue: string) => {
    if (!canScheduleOnNetwork(networkId)) return;

    setSchedulingDates(prev => {
      const newMap = new Map(prev);
      if (dateValue) {
        // Převedeme na ISO string s timezone
        const date = new Date(dateValue);
        newMap.set(networkId, date.toISOString());
      } else {
        newMap.delete(networkId);
      }
      return newMap;
    });
  }, [canScheduleOnNetwork, setSchedulingDates]);

  // Funkce pro použití stejného času pro všechny sítě
  const handleUseForAll = useCallback(() => {
    if (!canManageScheduling()) return;

    const linkedNetworks = getLinkedNetworks();
    if (linkedNetworks.length === 0) return;

    // Najdeme první nastavenou hodnotu nebo použijeme aktuální čas + 1 hodina
    const firstScheduledDate = Array.from(schedulingDates.values())[0];
    const defaultDate = firstScheduledDate || new Date(Date.now() + 60 * 60 * 1000).toISOString();

    setSchedulingDates(prev => {
      const newMap = new Map(prev);
      linkedNetworks.forEach(network => {
        if (canScheduleOnNetwork(network.id)) {
          newMap.set(network.id, defaultDate);
        }
      });
      return newMap;
    });
  }, [canManageScheduling, getLinkedNetworks, schedulingDates, canScheduleOnNetwork, setSchedulingDates]);

  // Funkce pro uložení plánování
  const handleSaveScheduling = useCallback(async () => {
    if (!currentPostId || !canManageScheduling()) return;

    const schedulesToSave = Array.from(schedulingDates.entries());
    const existingSchedulesToRemove = Array.from(existingSchedules.entries());

    try {
      // Nejprve zrušíme existující plánování, které už není v novém plánu
      for (const [networkId] of existingSchedulesToRemove) {
        if (!schedulingDates.has(networkId) && canScheduleOnNetwork(networkId)) {
          await unschedulePostMutation.mutateAsync({ postId: currentPostId, networkId });
        }
      }

      // Pak nastavíme nové plánování
      for (const [networkId, postDate] of schedulesToSave) {
        if (canScheduleOnNetwork(networkId)) {
          await schedulePostMutation.mutateAsync({ postId: currentPostId, networkId, postDate });
        }
      }

      // Zobrazíme zprávu o úspěchu i když nejsou žádná plánování (umožňuje zrušení všech)
      toast({
        title: 'Plánování uloženo',
        description: schedulesToSave.length > 0
          ? 'Všechna plánování byla úspěšně uložena'
          : 'Všechna plánování byla zrušena',
        status: 'success',
        duration: 2000,
      });

    } catch (error) {
      toast({
        title: 'Chyba při ukládání',
        description: 'Některá plánování se nepodařilo uložit',
        status: 'error',
        duration: 3000,
      });
    }
  }, [currentPostId, canManageScheduling, schedulingDates, existingSchedules, canScheduleOnNetwork, unschedulePostMutation, schedulePostMutation, toast]);

  // Funkce pro okamžité odeslání na všechny sítě
  const handleSendToAllNetworks = useCallback(async () => {
    if (!currentPostId) return;

    // Kontrola, zda je nastaveno plánování
    if (existingSchedules.size > 0) {
      // Nastavíme typ akce a otevřeme potvrzovací modal
      setConfirmAction('sendAll');
      onConfirmOpen();
      return;
    }

    // Pokud není plánování, odešleme rovnou na všechny sítě
    setPendingAction('sendAll');
    try {
      await sendToAllNetworksMutation.mutateAsync(currentPostId);
    } catch (error) {
      console.error('Chyba při odesílání na všechny sítě:', error);
    } finally {
      setPendingAction(null);
    }
  }, [currentPostId, existingSchedules.size, sendToAllNetworksMutation, onConfirmOpen]);

  // Funkce pro okamžité odeslání na vybrané sítě
  const handleSendToSelectedNetworks = useCallback(async () => {
    if (!currentPostId) return;

    const authorizedNetworks = getAuthorizedNetworksForSending();
    if (authorizedNetworks.length === 0) {
      toast({
        title: 'Žádná oprávnění',
        description: 'Nemáte oprávnění odeslat příspěvek na žádnou ze sociálních sítí',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Nastavíme výchozí výběr na všechny sítě, na které má uživatel oprávnění
    setSelectedNetworksForSend(authorizedNetworks.map(n => n.id));

    onOpen(); // Otevřeme modal pro výběr sítí
  }, [currentPostId, getAuthorizedNetworksForSending, onOpen, toast]);

  // Funkce pro zpracování odeslání na vybrané sítě z modalu
  const handleConfirmSendToSelected = useCallback(async () => {
    if (!currentPostId || selectedNetworksForSend.length === 0) return;

    // Kontrola, zda je nastaveno plánování - až po otevření modalu
    if (existingSchedules.size > 0) {
      // Zavřeme výběrový modal, resetujeme pending action a otevřeme potvrzovací
      onClose();
      setPendingAction(null); // Resetujeme pending action
      setConfirmAction('sendSelected');
      onConfirmOpen();
      return;
    }

    // Pokud není plánování, odešleme rovnou
    await handleSendConfirmed();
  }, [currentPostId, selectedNetworksForSend, existingSchedules.size, onClose, onConfirmOpen]);

  // Funkce pro finální odeslání po potvrzení
  const handleSendConfirmed = useCallback(async () => {
    if (!currentPostId || selectedNetworksForSend.length === 0) return;

    setPendingAction('sendSelected');

    try {
      // Odeslání na vybrané sítě
      for (const networkId of selectedNetworksForSend) {
        await sendToNetworkMutation.mutateAsync({
          postId: currentPostId,
          networkId: networkId
        });
      }

      toast({
        title: 'Příspěvek odeslán',
        description: 'Příspěvek byl úspěšně odeslán na vybrané sítě',
        status: 'success',
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: 'Chyba při odesílání',
        description: 'Nepodařilo se odeslat příspěvek na některé sítě',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setPendingAction(null);
      setSelectedNetworksForSend([]);
    }
  }, [currentPostId, selectedNetworksForSend, sendToNetworkMutation, toast]);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      w="100%"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        maxW={{ base: "100%", lg: "1400px" }}
        mx="auto"
        w="100%"
      >
        <VStack spacing={8} align="stretch" w="100%" px={{ base: 0, md: 0 }}>
          {/* Header */}
          <Box bg={useColorModeValue('white', 'gray.800')} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" w="100%" overflow="hidden">
            <VStack spacing={4} align="stretch" w="100%">
              <VStack
                spacing={3}
                align="stretch"
                w="100%"
                display={{ base: "flex", md: "none" }}
              >
                <Heading size="lg" wordBreak="break-word">
                  {!id ? 'Nový příspěvek' : `Editace příspěvku #${id}`}
                </Heading>
                <Text
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontSize="md"
                  wordBreak="break-word"
                >
                  {!id ? 'Vytvořte nový příspěvek pro sociální sítě' : 'Upravte obsah a nastavení příspěvku'}
                </Text>

                {/* Close button - Mobile */}
                <Button
                  onClick={handleClose}
                  size="md"
                  variant="outline"
                  colorScheme="gray"
                  w="100%"
                >
                  Zavřít editor
                </Button>
              </VStack>

              <HStack
                justifyContent="space-between"
                align="center"
                w="100%"
                display={{ base: "none", md: "flex" }}
                flexWrap="wrap"
                gap={4}
              >
                <VStack align="start" spacing={2}>
                  <Heading size="xl" wordBreak="break-word">
                    {!id ? 'Nový příspěvek' : `Editace příspěvku #${id}`}
                  </Heading>
                  <Text
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontSize="lg"
                    wordBreak="break-word"
                  >
                    {!id ? 'Vytvořte nový příspěvek pro sociální sítě' : 'Upravte obsah a nastavení příspěvku'}
                  </Text>
                </VStack>

                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    onClick={handleClose}
                    size="lg"
                    variant="outline"
                    colorScheme="gray"
                  >
                    Zavřít editor
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Main Content */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={{ base: 4, md: 6 }}
            borderRadius="lg"
            shadow="sm"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            w="100%"
            overflow="hidden"
          >
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">

          {/* Obsah postů */}
          {inputs.map((input, index) => (
            <Box key={index} position="relative">
              <FormControl>
                <FormLabel color={textColor}>
                  Post Text {index + 1}
                </FormLabel>
                <VStack align="stretch" spacing={3}>
                  <HStack align="start">
                    <Box flex="1">
                      <Textarea
                        value={input.text}
                        onChange={(e) => handleTextChangeWithPostCreation(index, e.target.value)}
                        minH={{ base: "120px", md: "150px" }}
                        maxLength={MAX_CHARS}
                        bg={inputBg}
                        borderColor={borderColor}
                        color={textColor}
                        fontSize={{ base: 'sm', md: 'md' }}
                      />
                      {(() => {
                        const limit = getCharacterLimit(input.contentId);
                        const currentLength = input.text.length;
                        const excessChars = getExcessCharacters(input.text, limit);
                        const isOverLimit = excessChars > 0;

                        return (
                          <HStack spacing={2} fontSize={{ base: 'xs', md: 'sm' }}>
                            <Text color={textColor}>
                              {currentLength}/{limit} characters
                            </Text>
                            {isOverLimit && (
                              <Text color="red.500" fontWeight="bold">
                                (+{excessChars} over limit)
                              </Text>
                            )}
                          </HStack>
                        );
                      })()}
                    </Box>
                    {index > 0 && (
                      <IconButton
                        aria-label="Remove input"
                        icon={<CloseIcon />}
                        onClick={() => handleRemoveInput(index)}
                        size={{ base: 'sm', md: 'md' }}
                      />
                    )}
                  </HStack>

                  {/* NetworkSelector pro výběr sociálních sítí */}
                  {((index === 0 && currentPostId) || input.contentId) && (
                    <Box mt={4}>
                      <Divider mb={3} />
                      <FormLabel color={textColor} fontSize={{ base: 'sm', md: 'md' }}>
                        Sociální sítě:
                      </FormLabel>
                      <NetworkSelector
                        availableNetworks={availableNetworks}
                        selectedNetworkIds={selectedNetworksByContent.get(input.contentId ?? 0) || []}
                        onNetworkToggle={(networkId, isSelected) => handleNetworkToggle(index, networkId, isSelected)}
                        isLoading={loadingNetworks}
                        isDisabled={linkContentMutation.isPending || unlinkContentMutation.isPending}
                      />
                    </Box>
                  )}
                </VStack>
              </FormControl>
              <Box mt={2}>
                <SaveStatusIndicator
                  status={input.saveStatus}
                  lastSaved={input.lastSaved}
                />
              </Box>
            </Box>
          ))}

          {/* Add button */}
          <Button
            leftIcon={<AddIcon />}
            onClick={handleAddNewInput}
            isDisabled={!currentPostId}
            size={{ base: 'sm', md: 'md' }}
            width={{ base: 'full', md: 'auto' }}
          >
            Přidat textové pole
          </Button>

          {/* Sekce editorů příspěvků */}
          {currentPostId && (
            <>
              <Divider />
              <UserSelector
                currentEditors={postEditors}
                onAddEditor={handleAddEditor}
                onRemoveEditor={handleRemoveEditor}
                isOwner={isOwner}
                disabled={addEditorMutation.isPending || removeEditorMutation.isPending}
              />
            </>
          )}

          {/* Sekce souborů */}
          {currentPostId && (
            <>
              <Divider />
              <AttachmentsSection
                currentPostId={currentPostId}
                postFiles={postFiles}
                uploadingFiles={uploadingFiles}
                availableNetworks={availableNetworks}
                selectedNetworksByAttachment={selectedNetworksByAttachment}
                onFileUpload={handleFileUpload}
                onNetworkToggle={handleAttachmentNetworkToggle}
                onRemoveFile={(fileId) => {
                  removeFileMutation.mutate({
                    postId: currentPostId,
                    attachmentId: fileId
                  });
                }}
                isNetworkSelectorDisabled={linkAttachmentMutation.isPending || unlinkAttachmentMutation.isPending}
                isUploadDisabled={uploadFileMutation.isPending}
                maxFileSizeFormatted={formatFileSize(maxFileSize)}
              />
            </>
          )}

          {/* Sekce plánování */}
          {currentPostId && (
            <>
              <Divider />
              <SchedulingSection
                availableNetworks={availableNetworks}
                existingSchedules={existingSchedules}
                schedulingDates={schedulingDates}
                sentNetworks={sentNetworks}
                canManageScheduling={canManageScheduling()}
                canScheduleOnNetwork={canScheduleOnNetwork}
                getLinkedNetworks={getLinkedNetworks}
                onScheduleDateChange={handleScheduleDateChange}
                onUseForAll={handleUseForAll}
                onSaveScheduling={handleSaveScheduling}
                isSaving={schedulePostMutation.isPending || unschedulePostMutation.isPending}
              />
            </>
          )}

          {/* Tlačítka na konci stránky */}
          {currentPostId && getLinkedNetworks().length > 0 ? (
            <HStack spacing={4} wrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              <Button
                colorScheme="red"
                onClick={handleSendToAllNetworks}
                isLoading={sendToAllNetworksMutation.isPending}
                size={{ base: 'sm', md: 'md' }}
                width={{ base: 'full', sm: 'auto' }}
                isDisabled={!canSendPost()}
              >
                Odeslat ihned na všechny sítě
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleSendToSelectedNetworks}
                isLoading={pendingAction === 'sendSelected'}
                size={{ base: 'sm', md: 'md' }}
                width={{ base: 'full', sm: 'auto' }}
                isDisabled={!canSendPost()}
              >
                Odeslat ihned na vybrané
              </Button>
              <Button
                onClick={handleClose}
                size={{ base: 'sm', md: 'md' }}
                variant="outline"
                colorScheme="gray"
                width={{ base: 'full', sm: 'auto' }}
              >
                Zavřít
              </Button>
            </HStack>
          ) : (
            <Button
              onClick={handleClose}
              size={{ base: 'sm', md: 'md' }}
              variant="outline"
              colorScheme="gray"
              width={{ base: 'full', md: 'auto' }}
            >
              Zavřít
            </Button>
          )}

          {/* Modal pro výběr sítí */}
          <NetworkSelectionModal
            isOpen={isOpen}
            onClose={onClose}
            authorizedNetworks={getAuthorizedNetworksForSending()}
            selectedNetworks={selectedNetworksForSend}
            onNetworkToggle={(networkId, isSelected) => {
              if (isSelected) {
                setSelectedNetworksForSend(prev => [...prev, networkId]);
              } else {
                setSelectedNetworksForSend(prev => prev.filter(id => id !== networkId));
              }
            }}
            onConfirm={handleConfirmSendToSelected}
            isLoading={pendingAction === 'sendSelected'}
          />

          {/* Potvrzovací modal */}
          <ConfirmationModal
            isOpen={isConfirmOpen}
            onClose={() => {
              onConfirmClose();
              setConfirmAction(null);
              if (confirmAction === 'sendSelected') {
                onOpen();
              }
            }}
            title={confirmAction === 'sendAll' ? 'Odeslat na všechny sítě?' : 'Odeslat na vybrané sítě?'}
            message={confirmAction === 'sendAll'
              ? 'Tato akce odešle příspěvek okamžitě na všechny propojené sociální sítě a zruší všechna naplánovaná odeslání. Opravdu chcete pokračovat?'
              : 'Tato akce odešle příspěvek okamžitě na vybrané sociální sítě a zruší všechna naplánovaná odeslání pro tyto sítě. Opravdu chcete pokračovat?'
            }
            confirmText="Odeslat ihned"
            cancelText="Zrušit"
            colorScheme="red"
            onConfirm={async () => {
              if (confirmAction === 'sendAll') {
                setPendingAction('sendAll');
                try {
                  await sendToAllNetworksMutation.mutateAsync(currentPostId!);
                } catch (error) {
                  console.error('Chyba při odesílání na všechny sítě:', error);
                } finally {
                  setPendingAction(null);
                }
              } else if (confirmAction === 'sendSelected') {
                await handleSendConfirmed();
              }
              setConfirmAction(null);
              onConfirmClose();
            }}
            isLoading={pendingAction === confirmAction}
          />
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default PostEditorPage;
