import { Star } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Review {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  comment: string;
}

interface CourseReviewsProps {
  courseId?: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Amara James",
    initials: "AJ",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Excellent course! The explanations are clear, practical, and easy to follow. I learned skills I can actually apply.",
  },
  {
    id: "2",
    name: "Susan Yakubu",
    initials: "SY",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "I really enjoyed the learning experience. The lessons are well structured and the content is very informative.",
  },
  {
    id: "3",
    name: "Wale Michael",
    initials: "WM",
    rating: 4,
    date: " 5 days ago",
    comment:
      "Very useful training with practical examples. I would appreciate even more hands-on exercises in future lessons.",
  },
];

const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  reviews,
  averageRating,
  totalReviews,
}) => {
  // Real API reviews can replace these sample reviews later.
  const displayedReviews =
    reviews && reviews.length > 0 ? reviews : SAMPLE_REVIEWS;

  const calculatedRating =
    displayedReviews.reduce((sum, review) => sum + review.rating, 0) /
    displayedReviews.length;

  const rating = averageRating ?? calculatedRating;
  const count = totalReviews ?? displayedReviews.length;

  const renderStars = (value: number) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          color="#F97316"
          fill={star <= Math.round(value) ? "#F97316" : "transparent"}
        />
      ))}{" "}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Student Reviews</Text>
      <Text style={styles.subtitle}>
        See what learners think about this learning experience.{" "}
      </Text>

      <View style={styles.summary}>
        <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>

        <View style={styles.ratingDetails}>
          {renderStars(rating)}
          <Text style={styles.reviewCount}>
            {count} {count === 1 ? "review" : "reviews"}
          </Text>
        </View>
      </View>

      {displayedReviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{review.initials}</Text>
            </View>

            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{review.name}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          </View>

          {renderStars(review.rating)}

          <Text style={styles.comment}>{review.comment}</Text>
        </View>
      ))}

      <Text style={styles.footer}>
        Reviews help learners make informed decisions.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 19,
    fontWeight: "700",
    color: "#171717",
  },
  subtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
    marginBottom: 18,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderColor: "#F97316",
    borderWidth: 1,
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginRight: 16,
  },
  ratingDetails: {
    gap: 5,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  reviewCount: {
    fontSize: 12,
    color: "#fff",
  },
  reviewCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  reviewDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },
  comment: {
    fontSize: 13,
    lineHeight: 20,
    color: "#fff",
    marginTop: 10,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 8,
  },
});

export default CourseReviews;
