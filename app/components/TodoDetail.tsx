import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  Check,
  Clock,
  Edit3,
  FileText,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  category: "personal" | "work" | "shopping";
  completed: boolean;
  created_at: string;
  user_id: string;
}

interface TodoDetailProps {
  todo: Todo;
  visible: boolean;
  onClose: () => void;
  onUpdate: (updatedTodo: Todo) => void;
  onDelete: (todoId: string) => void;
  onToggleComplete: (todoId: string, completed: boolean) => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  todo,
  visible,
  onClose,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || "",
    due_date: todo.due_date ? new Date(todo.due_date) : new Date(),
    due_time: todo.due_time
      ? new Date(`2000-01-01T${todo.due_time}`)
      : new Date(),
    category: todo.category,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return <BriefcaseBusiness size={24} color="#fff" opacity={0.9} />;
      case "shopping":
        return <ShoppingBag size={24} color="#fff" opacity={0.9} />;
      default:
        return <UserRound size={24} color="#fff" opacity={0.9} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "#FFBF78";
      case "shopping":
        return "#9BC09C";
      default:
        return "#4facfe";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "work":
        return "Work";
      case "shopping":
        return "Shopping";
      default:
        return "Personal";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "No time set";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilDue = () => {
    if (!todo.due_date || !todo.due_time) return null;

    const dueDateTime = new Date(`${todo.due_date}T${todo.due_time}`);
    const now = new Date();
    const diff = dueDateTime.getTime() - now.getTime();

    if (diff < 0) {
      return { text: "Overdue", color: "#E16A54", isOverdue: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return {
        text: `${days} day${days > 1 ? "s" : ""} left`,
        color: "#4ECDC4",
        isOverdue: false,
      };
    } else if (hours > 0) {
      return {
        text: `${hours} hour${hours > 1 ? "s" : ""} left`,
        color: "#FFD93D",
        isOverdue: false,
      };
    } else {
      return {
        text: `${minutes} minute${minutes > 1 ? "s" : ""} left`,
        color: "#FF6B6B",
        isOverdue: false,
      };
    }
  };

  const handleSaveEdit = () => {
    if (editData.title.trim() === "") {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const updatedTodo: Todo = {
      ...todo,
      title: editData.title.trim(),
      description: editData.description.trim() || undefined,
      due_date: editData.due_date.toISOString().split("T")[0],
      due_time: editData.due_time.toTimeString().split(" ")[0].slice(0, 5),
      category: editData.category,
    };

    onUpdate(updatedTodo);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete(todo.id);
          onClose();
        },
      },
    ]);
  };

  const timeUntilDue = getTimeUntilDue();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerActions}>
            {!isEditing && (
              <>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.headerButton}>
                  <Edit3 size={20} color="#4FACFE" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.headerButton}>
                  <Trash2 size={20} color="#E16A54" />
                </TouchableOpacity>
              </>
            )}
            {isEditing && (
              <>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  style={styles.headerButton}>
                  <Check size={20} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={styles.headerButton}>
                  <X size={20} color="#E16A54" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  todo.completed && styles.completeButtonActive,
                ]}
                onPress={() => onToggleComplete(todo.id, todo.completed)}>
                {todo.completed && <Check size={16} color="#fff" />}
              </TouchableOpacity>
              <Text
                style={[
                  styles.statusText,
                  todo.completed && styles.completedStatusText,
                ]}>
                {todo.completed ? "Completed" : "Pending"}
              </Text>
            </View>
            {timeUntilDue && !todo.completed && (
              <View
                style={[
                  styles.timeLeftBadge,
                  { backgroundColor: `${timeUntilDue.color}20` },
                ]}>
                <Text
                  style={[styles.timeLeftText, { color: timeUntilDue.color }]}>
                  {timeUntilDue.text}
                </Text>
              </View>
            )}
          </View>

          {/* Title Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={editData.title}
                onChangeText={(text) =>
                  setEditData({ ...editData, title: text })
                }
                placeholder="Enter task title"
                placeholderTextColor="#999"
              />
            ) : (
              <Text
                style={[styles.title, todo.completed && styles.completedTitle]}>
                {todo.title}
              </Text>
            )}
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            {isEditing ? (
              <View style={styles.categoryContainer}>
                {[
                  { key: "personal", icon: "👤", label: "Personal" },
                  { key: "work", icon: "💼", label: "Work" },
                  { key: "shopping", icon: "🛒", label: "Shopping" },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryButton,
                      editData.category === cat.key && styles.selectedCategory,
                    ]}
                    onPress={() =>
                      setEditData({ ...editData, category: cat.key as any })
                    }>
                    <Text style={styles.categoryButtonIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        editData.category === cat.key &&
                          styles.selectedCategoryLabel,
                      ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.categoryDisplay}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: getCategoryColor(todo.category) },
                  ]}>
                  {getCategoryIcon(todo.category)}
                </View>
                <Text style={styles.categoryName}>
                  {getCategoryName(todo.category)}
                </Text>
              </View>
            )}
          </View>

          {/* Date & Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Due Date & Time</Text>
            {isEditing ? (
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}>
                  <Calendar size={16} color="#4FACFE" />
                  <Text style={styles.dateButtonText}>
                    {editData.due_date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}>
                  <Clock size={16} color="#4FACFE" />
                  <Text style={styles.timeButtonText}>
                    {editData.due_time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.dateTimeDisplay}>
                <View style={styles.dateTimeItem}>
                  <Calendar size={18} color="#4FACFE" />
                  <Text style={styles.dateTimeText}>
                    {formatDate(todo.due_date)}
                  </Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Clock size={18} color="#4FACFE" />
                  <Text style={styles.dateTimeText}>
                    {formatTime(todo.due_time)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={editData.description}
                onChangeText={(text) =>
                  setEditData({ ...editData, description: text })
                }
                placeholder="Add your notes here"
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            ) : (
              <View style={styles.descriptionDisplay}>
                {todo.description ? (
                  <Text style={styles.description}>{todo.description}</Text>
                ) : (
                  <View style={styles.emptyDescription}>
                    <FileText size={24} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyDescriptionText}>
                      No notes added
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Meta Information */}
          <View style={styles.metaSection}>
            <Text style={styles.metaTitle}>Task Information</Text>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Created:</Text>
              <Text style={styles.metaValue}>
                {new Date(todo.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status:</Text>
              <Text
                style={[
                  styles.metaValue,
                  todo.completed ? styles.completedMeta : styles.pendingMeta,
                ]}>
                {todo.completed ? "Completed" : "In Progress"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={editData.due_date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setEditData({ ...editData, due_date: selectedDate });
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={editData.due_time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setEditData({ ...editData, due_time: selectedTime });
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  completeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  completeButtonActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  completedStatusText: {
    color: "#4ECDC4",
  },
  timeLeftBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeLeftText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 32,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  titleInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCategory: {
    borderColor: "#4FACFE",
    backgroundColor: "rgba(79, 172, 254, 0.15)",
  },
  categoryButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  selectedCategoryLabel: {
    color: "#4FACFE",
    fontWeight: "600",
  },
  dateTimeDisplay: {
    gap: 12,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  descriptionDisplay: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
  },
  emptyDescription: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    gap: 8,
  },
  emptyDescriptionText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
  descriptionInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 120,
  },
  metaSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4FACFE",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  metaLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  metaValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  completedMeta: {
    color: "#4ECDC4",
  },
  pendingMeta: {
    color: "#FFD93D",
  },
});

export default TodoDetail;
