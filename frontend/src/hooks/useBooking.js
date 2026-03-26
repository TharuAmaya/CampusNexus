import { useQuery } from '@tanstack/react-query';
import * as bookingApi from '../services/api/bookingApi';
import { QUERY_KEYS } from '../constants/routes';

/**
 * Custom hook for booking-related queries
 */
export const useBooking = (bookingId) => {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKING_DETAILS, bookingId],
    queryFn: () => bookingApi.getBooking(bookingId),
    enabled: !!bookingId,
  });
};
