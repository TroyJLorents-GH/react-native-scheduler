import PomodoroTimer from '@/components/PomodoroTimer';
import { useTodoContext } from '@/context/TodoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Linking, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TaskDetailsScreen() {
  const { id, autostart } = useLocalSearchParams<{ id: string; autostart?: string }>();
  const { todos, toggleTodo, toggleSubTask, updateTodo } = useTodoContext();
  const [moreExpanded, setMoreExpanded] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>The requested task could not be found.</Text>
        </View>
      </View>
    );
  }

  const handleTimerComplete = () => {
    // Optionally mark the task as done when Pomodoro is completed
    // updateTodo(todo.id, { done: true });
  };

  const shouldAutoStart = useMemo(() => autostart === '1' || autostart === 'true', [autostart]);
  const priorityColor = todo?.priority === 'high' ? '#FF6B6B' : todo?.priority === 'medium' ? '#FFD93D' : todo?.priority === 'low' ? '#6BCF7F' : undefined;
  const priorityAbbr = todo?.priority === 'high' ? 'H' : todo?.priority === 'medium' ? 'M' : todo?.priority === 'low' ? 'L' : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/todo/lists'
        })}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRightRow}>
          <TouchableOpacity onPress={async () => {
            try {
              const parts: string[] = [];
              parts.push(`Task: ${todo.text}`);
              if (todo.notes) parts.push(`Notes: ${todo.notes}`);
              if (todo.dueDate) {
                const d = new Date(todo.dueDate);
                parts.push(`Due: ${d.toLocaleString()}`);
              }
              if (todo.location) {
                // Prefer coords link if available
                let loc = todo.location;
                if (todo.locationCoords) {
                  loc = `http://maps.apple.com/?daddr=${todo.locationCoords}`;
                }
                parts.push(`Location: ${loc}`);
              }
              const message = parts.join('\n');
              await Share.share({ message });
            } catch {}
          }} style={{ marginRight: 16 }}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({
            pathname: '/todo/new',
            params: { editId: todo.id }
          })}>
            <Ionicons name="create-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Title */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => toggleTodo(todo.id)}
            >
              <Ionicons 
                name={todo.done ? 'checkmark-circle' : 'ellipse-outline'} 
                size={24} 
                color={todo.done ? '#67c99a' : '#bbb'} 
              />
            </TouchableOpacity>
            <Text style={[styles.title, todo.done && styles.doneText]}>
              {todo.text}
            </Text>
            {priorityColor && priorityAbbr && (
              <View style={[styles.prioritySupBadge, { backgroundColor: priorityColor }]}>
                <Text style={styles.prioritySupText}>{priorityAbbr}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Work Session Pomodoro */}
        {todo.pomodoro?.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Session Pomodoro</Text>
            <PomodoroTimer 
              settings={todo.pomodoro}
              onComplete={handleTimerComplete}
              autoStart={shouldAutoStart}
            />
          </View>
        )}

        {/* Notes */}
        {todo.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{todo.notes}</Text>
          </View>
        )}

        {/* Images */}
        {todo.images && todo.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <View style={styles.imagesGrid}>
              {todo.images.map((uri, idx) => (
                <TouchableOpacity
                  key={uri}
                  style={styles.imageItem}
                  onPress={() => {
                    setImageIndex(idx);
                    setImageViewerOpen(true);
                  }}
                >
                  <Image source={{ uri }} style={styles.imageThumb} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Subtasks */}
        {todo.subTasks && todo.subTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subtasks</Text>
            {todo.subTasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskRow}
                onPress={() => toggleSubTask(todo.id, subtask.id)}
              >
                <Ionicons
                  name={subtask.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={subtask.done ? '#67c99a' : '#bbb'}
                />
                <Text style={[
                  styles.subtaskText,
                  subtask.done && styles.doneText
                ]}>
                  {subtask.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Due Date */}
        {todo.dueDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <View style={styles.dueDateRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dueDateText}>
                {new Date(todo.dueDate).toLocaleDateString(undefined, { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
                {todo.dueDate && new Date(todo.dueDate).getHours() !== 0 && (
                  ` at ${new Date(todo.dueDate).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        {todo.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity 
              style={styles.locationRow}
              onPress={() => {
                // Use stored coordinates if available, otherwise extract from location string
                if (todo.locationCoords) {
                  const url = `http://maps.apple.com/?daddr=${todo.locationCoords}`;
                  Linking.openURL(url);
                } else {
                  // Fallback: Extract coordinates from location string if available
                  const locationMatch = todo.location?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                  if (locationMatch) {
                    const [, lat, lng] = locationMatch;
                    const url = `http://maps.apple.com/?daddr=${lat},${lng}`;
                    Linking.openURL(url);
                  } else {
                    // If no coordinates, search by address
                    const encodedAddress = encodeURIComponent(todo.location || '');
                    const url = `http://maps.apple.com/?q=${encodedAddress}`;
                    Linking.openURL(url);
                  }
                }
              }}
            >
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.locationText}>{todo.location}</Text>
              <Ionicons name="navigate" size={16} color="#007AFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Priority section removed; priority shown as superscript next to title */}

        {/* More Section */}
        {(todo.repeat || todo.earlyReminder || todo.location || todo.url || (todo.images && todo.images.length > 0)) && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.moreHeader}
              onPress={() => setMoreExpanded(!moreExpanded)}
            >
              <Text style={styles.sectionTitle}>More</Text>
              <Ionicons 
                name={moreExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            {moreExpanded && (
              <View style={styles.moreContainer}>
                {todo.repeat && (
                  <View style={styles.moreRow}>
                    <Ionicons name="repeat" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Repeat: {todo.repeat}</Text>
                  </View>
                )}
                {todo.earlyReminder && (
                  <View style={styles.moreRow}>
                    <Ionicons name="notifications" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Early Reminder: {todo.earlyReminder}</Text>
                  </View>
                )}

                {todo.url && (
                  <View style={styles.moreRow}>
                    <Ionicons name="link" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>URL: {todo.url}</Text>
                  </View>
                )}
                {todo.images && todo.images.length > 0 && (
                  <View style={styles.moreRow}>
                    <Ionicons name="images" size={20} color="#007AFF" />
                    <Text style={styles.moreText}>Images: {todo.images.length} attached</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      {todo.images && todo.images.length > 0 && (
        <Modal visible={imageViewerOpen} animationType="fade" transparent={true} onRequestClose={() => setImageViewerOpen(false)}>
          <View style={styles.viewerBackdrop}>
            <TouchableOpacity style={styles.viewerClose} onPress={() => setImageViewerOpen(false)}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <View style={styles.viewerBody}>
              <Image source={{ uri: todo.images[imageIndex] }} style={styles.viewerImage} />
            </View>
            {todo.images.length > 1 && (
              <View style={styles.viewerNav}>
                <TouchableOpacity
                  style={styles.viewerNavBtn}
                  onPress={() => setImageIndex((prev) => (prev - 1 + todo.images!.length) % todo.images!.length)}
                >
                  <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.viewerIndex}>{imageIndex + 1} / {todo.images.length}</Text>
                <TouchableOpacity
                  style={styles.viewerNavBtn}
                  onPress={() => setImageIndex((prev) => (prev + 1) % todo.images!.length)}
                >
                  <Ionicons name="chevron-forward" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    lineHeight: 32,
  },
  prioritySupBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    marginTop: 2,
  },
  prioritySupText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#8e8e93',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  notes: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageItem: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  dueDateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  priorityRow: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  subtaskText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  pomodoroInfo: {
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  pomodoroText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  moreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moreContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 2,
  },
  viewerBody: {
    width: '100%',
    paddingHorizontal: 16,
  },
  viewerImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
  },
  viewerNav: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  viewerNavBtn: {
    padding: 8,
  },
  viewerIndex: {
    color: '#fff',
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383a',
  },
  moreText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
