import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, getPropertyById, getHostProperties, createProperty, deleteProperty } from '../api/propertyApi';
import toast from 'react-hot-toast';

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });
};

export const useProperty = (id) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
  });
};

export const useHostProperties = () => {
  return useQuery({
    queryKey: ['host-properties'],
    queryFn: getHostProperties,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      toast.success('Property created successfully!');
      queryClient.invalidateQueries({ queryKey: ['host-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create property');
    }
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      toast.success('Property deleted');
      queryClient.invalidateQueries({ queryKey: ['host-properties'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  });
};
