import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Alert,
	TextInput as RNTextInput,
} from "react-native"; // Renamed to avoid conflict
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { createReview } from "../../../services/reviewService"; // Adjusted
import AppTextInput from "../../../components/UI/AppTextInput"; // Adjusted
import AppButton from "../../../components/UI/AppButton"; // Adjusted
import LoadingOverlay from "../../../components/UI/LoadingOverlay"; // Adjusted
import { COLORS } from "../../../constants/colors"; // Adjusted
import { getErrorMessage } from "../../../utils/helpers"; // Adjusted
// For star rating, you might use a library or simple TouchableOpacity buttons
import { Ionicons } from "@expo/vector-icons";
// import { TouchableOpacity } from 'react-native-gesture-handler';

import { TouchableOpacity } from "react-native";

const AddReviewScreen = () => {
	const router = useRouter();
	// Params expected: rideId, revieweeId, reviewType ('driver_review' or 'rider_review')
	const { rideId, revieweeId, reviewType, revieweeName } =
		useLocalSearchParams();

	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmitReview = async () => {
		if (!rideId || !revieweeId || !reviewType) {
			Alert.alert("Error", "Missing necessary information to submit review.");
			return;
		}
		if (rating === 0) {
			Alert.alert("Error", "Please select a rating.");
			return;
		}
		setLoading(true);
		try {
			await createReview({
				rideId: rideId,
				revieweeId: revieweeId,
				rating,
				comment,
				reviewType: reviewType,
			});
			Alert.alert("Success", "Review submitted successfully!");
			router.back(); // Or navigate to a relevant screen
		} catch (error) {
			Alert.alert("Review Submission Failed", getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: `Review ${revieweeName || "User"}` }} />
			<ScrollView style={styles.container}>
				<LoadingOverlay visible={loading} />
				<Text style={styles.title}>Leave a Review</Text>
				{revieweeName && (
					<Text style={styles.subTitle}>You are reviewing: {revieweeName}</Text>
				)}

				<Text style={styles.label}>Rating:</Text>
				<View style={styles.starsContainer}>
					{[1, 2, 3, 4, 5].map((star) => (
						<TouchableOpacity key={star} onPress={() => setRating(star)}>
							<Ionicons
								name={star <= rating ? "star" : "star-outline"}
								size={36}
								color={COLORS.warning}
								style={styles.star}
							/>
						</TouchableOpacity>
					))}
				</View>

				<AppTextInput
					label="Comment (optional)"
					value={comment}
					onChangeText={setComment}
					multiline
					numberOfLines={4}
					placeholder="Share your experience..."
				/>
				<AppButton
					title="Submit Review"
					onPress={handleSubmitReview}
					loading={loading}
				/>
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: COLORS.light,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		color: COLORS.primary,
		marginBottom: 5,
		textAlign: "center",
	},
	subTitle: {
		fontSize: 16,
		color: COLORS.secondary,
		marginBottom: 20,
		textAlign: "center",
	},
	label: {
		fontSize: 16,
		color: COLORS.dark,
		marginBottom: 8,
	},
	starsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 20,
	},
	star: {
		marginHorizontal: 5,
	},
});

export default AddReviewScreen;
