import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { formatDate } from '../utils/helpers';

const ReviewCard = ({ review }) => {
  if (!review) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.reviewerName}>{review.reviewer?.name || 'Anonymous'}</Text>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.rating ? 'star' : 'star-outline'}
              size={16}
              color={COLORS.warning}
            />
          ))}
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      {review.ride && (
        <Text style={styles.rideInfo}>
          Ride: {review.ride.startLocation?.address} to {review.ride.endLocation?.address}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: COLORS.grey,
    textAlign: 'right',
  },
  rideInfo: {
    fontSize: 12,
    color: COLORS.info,
    marginTop: 5,
    fontStyle: 'italic',
  }
});

export default ReviewCard;
