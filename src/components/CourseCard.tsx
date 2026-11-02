import {
  PlayIcon,
  ShoppingCart01Icon,
  StarIcon,
  TickDouble01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../context/AppContext";
import { Course } from "../data/mockData";

interface CourseCardProps {
  course: Course;
  horizontal?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  horizontal = true,
}) => {
  const router = useRouter();
  const { cartIds, addToCart, formatPrice, colors } = useApp();

  const isInCart = cartIds.some((id) => String(id) === String(course.id));

  // Recognize purchased courses.
  const isEnrolled = course.isEnrolled === true || (course.progress ?? 0) > 0;

  const handlePress = () => {
    router.push({ pathname: "/course/[id]", params: { id: course.id } });
  };

  const handleStartLearning = (e: any) => {
    e.stopPropagation();

    router.push({
      pathname: "/course-viewer/[id]",
      params: { id: course.id },
    });
  };
  const handleCartPress = (e: any) => {
    e.stopPropagation();
    addToCart(course.id);
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[
          styles.horizontalCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.88}
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.horizontalImage}
          />
          <View
            style={[
              styles.tagBadge,
              {
                backgroundColor: course.isBundle
                  ? colors.accent
                  : colors.accentLight,
                borderColor: colors.accentBorder,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.tagBadgeText,
                { color: course.isBundle ? "#FFF" : colors.accent },
              ]}
            >
              {course.isBundle
                ? course.bundleBadge || "Special Bundle"
                : course.category}
            </Text>
          </View>
          {course.isBundle && course.packages && course.packages.length > 0 && (
            <View style={styles.packageCountBadge}>
              <Text style={styles.packageCountText}>
                {course.packages.length} In-1 Bundle
              </Text>
            </View>
          )}
        </View>

        <View style={styles.horizontalContent}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {course.title}
          </Text>
          <Text style={[styles.author, { color: colors.textSecondary }]}>
            By: {course.instructor}
          </Text>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.statPill,
                { backgroundColor: colors.surfaceLight },
              ]}
            >
              <HugeiconsIcon
                icon={UserGroupIcon}
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {course.studentsCount > 0
                  ? course.studentsCount.toLocaleString()
                  : "0"}
              </Text>
            </View>
            <View
              style={[
                styles.statPill,
                { backgroundColor: colors.surfaceLight },
              ]}
            >
              <HugeiconsIcon
                icon={StarIcon}
                size={12}
                color={colors.secondary}
              />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {course.isNew
                  ? "New Course"
                  : `${course.rating} (${course.reviewsCount})`}
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text
                style={[styles.discountText, { color: colors.textSecondary }]}
              >
                {course.discount}% Disc.{" "}
                <Text style={styles.strikePrice}>
                  {formatPrice(course.originalPrice)}
                </Text>
              </Text>
              <Text style={[styles.priceText, { color: colors.text }]}>
                {formatPrice(course.price)}
              </Text>
            </View>

            {isEnrolled ? (
              <TouchableOpacity
                style={styles.startLearningBtn}
                onPress={handleStartLearning}
                activeOpacity={0.85}
              >
                <HugeiconsIcon icon={PlayIcon} size={15} color="#FFF" />
                <Text style={styles.startLearningText}>Start Learning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.cartBtn,
                  { backgroundColor: isInCart ? "#10B981" : colors.accent },
                ]}
                onPress={handleCartPress}
              >
                <HugeiconsIcon
                  icon={isInCart ? TickDouble01Icon : ShoppingCart01Icon}
                  size={isInCart ? 18 : 16}
                  color="#FFF"
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.daysLeftText, { color: colors.error }]}>
            {course.daysLeft} days left
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical List Item
  return (
    <TouchableOpacity
      style={[
        styles.verticalCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      activeOpacity={0.88}
      onPress={handlePress}
    >
      <Image source={{ uri: course.thumbnail }} style={styles.verticalImage} />

      <View style={styles.verticalRight}>
        <View style={styles.verticalHeader}>
          <Text
            style={[styles.verticalTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {course.title}
          </Text>
          {isEnrolled ? (
            <TouchableOpacity
              style={styles.startLearningBtn}
              onPress={handleStartLearning}
              activeOpacity={0.85}
            >
              <HugeiconsIcon icon={PlayIcon} size={13} color="#FFF" />
              <Text style={styles.startLearningText}>Start Learning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.smallCartBtn,
                { backgroundColor: isInCart ? "#10B981" : colors.accent },
              ]}
              onPress={handleCartPress}
            >
              <HugeiconsIcon
                icon={isInCart ? TickDouble01Icon : ShoppingCart01Icon}
                size={isInCart ? 16 : 14}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.author, { color: colors.textSecondary }]}>
          By: {course.instructor}
        </Text>

        <View style={styles.statsRow}>
          <View
            style={[styles.statPill, { backgroundColor: colors.surfaceLight }]}
          >
            <HugeiconsIcon
              icon={UserGroupIcon}
              size={11}
              color={colors.textSecondary}
            />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {course.studentsCount > 0
                ? course.studentsCount.toLocaleString()
                : "0"}
            </Text>
          </View>
          <View
            style={[styles.statPill, { backgroundColor: colors.surfaceLight }]}
          >
            <HugeiconsIcon icon={StarIcon} size={11} color={colors.secondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {course.isNew
                ? "New Course"
                : `${course.rating} (${course.reviewsCount})`}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text
              style={[styles.discountText, { color: colors.textSecondary }]}
            >
              {course.discount}% Disc.{" "}
              <Text style={styles.strikePrice}>
                {formatPrice(course.originalPrice)}
              </Text>
            </Text>
            <Text style={[styles.priceText, { color: colors.text }]}>
              {formatPrice(course.price)}
            </Text>
          </View>
          <Text style={[styles.daysLeftText, { color: colors.error }]}>
            {course.daysLeft} days left
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horizontalCard: {
    width: 270,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 14,
    marginBottom: 8,
  },
  imageContainer: {
    position: "relative",
    height: 145,
    width: "100%",
  },
  horizontalImage: {
    width: "100%",
    height: "100%",
  },
  tagBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  packageCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(6, 9, 18, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  packageCountText: {
    color: "#f97316",
    fontSize: 10,
    fontWeight: "700",
  },
  horizontalContent: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 18,
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  discountText: {
    fontSize: 10,
  },
  strikePrice: {
    textDecorationLine: "line-through",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  daysLeftText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },

  verticalCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  verticalImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  verticalRight: {
    flex: 1,
    justifyContent: "space-between",
  },
  verticalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  verticalTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 17,
  },
  smallCartBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  startLearningBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },

  startLearningText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
