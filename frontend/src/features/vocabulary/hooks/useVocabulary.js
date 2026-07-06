// src/features/vocabulary/hooks/useVocabulary.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as vocabApi from "../../../services/vocabularyService";

export function useVocabulary() {
  const queryClient = useQueryClient();

  // Fetch vocabulary list
  const { data: vocabulary = [], isLoading: isLoadingVocab, refetch: refreshVocab } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: vocabApi.getVocabulary,
  });

  // Fetch vocabulary stats
  const { data: stats = null, isLoading: isLoadingStats, refetch: refreshStats } = useQuery({
    queryKey: ["vocabularyStats"],
    queryFn: vocabApi.getVocabularyStats,
  });

  const isLoading = isLoadingVocab || isLoadingStats;

  // Refresh both
  const refresh = () => {
    refreshVocab();
    refreshStats();
  };

  // Remove word mutation
  const removeWordMutation = useMutation({
    mutationFn: (id) => vocabApi.deleteVocabulary(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] });
      const previousVocab = queryClient.getQueryData(["vocabulary"]);
      
      // Optimistically update
      queryClient.setQueryData(["vocabulary"], (old) => 
        old ? old.filter((w) => w._id !== id) : []
      );
      
      // Optimistically update stats if available
      queryClient.setQueryData(["vocabularyStats"], (old) => 
        old ? { ...old, totalSaved: old.totalSaved - 1 } : null
      );
      
      return { previousVocab };
    },
    onError: (err, id, context) => {
      console.error("Failed to delete word", err);
      queryClient.setQueryData(["vocabulary"], context.previousVocab);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["vocabularyStats"] });
    },
  });

  // Review word mutation
  const reviewWordMutation = useMutation({
    mutationFn: ({ id, score }) => vocabApi.submitReview(id, score),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] });
      const previousVocab = queryClient.getQueryData(["vocabulary"]);
      return { previousVocab };
    },
    onSuccess: (updatedWord) => {
      queryClient.setQueryData(["vocabulary"], (old) => 
        old ? old.map((w) => (w._id === updatedWord._id ? updatedWord : w)) : []
      );
    },
    onError: (err, variables, context) => {
      console.error("Failed to review word", err);
      queryClient.setQueryData(["vocabulary"], context.previousVocab);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
      queryClient.invalidateQueries({ queryKey: ["vocabularyStats"] });
    },
  });

  return {
    vocabulary,
    stats,
    isLoading,
    removeWord: (id) => removeWordMutation.mutateAsync(id),
    reviewWord: (id, score) => reviewWordMutation.mutateAsync({ id, score }),
    refresh,
  };
}
