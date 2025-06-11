import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TodoItem({
  content,
  onDelete,
}: {
  content: string;
  onDelete: () => void;
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.text}>{content}</Text>
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        activeOpacity={0.7}>
        <Text style={styles.deleteText}>❌</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    // Android elevation
    elevation: 3,
  },
  text: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    flexShrink: 1, // allow text to wrap or shrink if needed
  },
  deleteButton: {
    backgroundColor: "#FF5C5C",
    borderRadius: 18,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
  },
});
