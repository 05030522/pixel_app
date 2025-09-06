import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InterestSelectorProps {
  data: { [key: string]: string[] };
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  data,
  selectedItems,
  onSelectionChange,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === category ? null : category);
  };

  const handleSelect = (item: string) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    onSelectionChange(newSelection);
  };

  return (
    <View style={styles.container}>
      {Object.keys(data).map(category => (
        <View key={category} style={styles.categoryContainer}>
          <TouchableOpacity
            onPress={() => toggleExpand(category)}
            style={styles.header}
          >
            <Text style={styles.headerText}>{category}</Text>
            <Text style={styles.headerIcon}>
              {expanded === category ? '−' : '+'}
            </Text>
          </TouchableOpacity>
          {expanded === category && (
            <View style={styles.tagContainer}>
              {data[category].map(item => (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.tag,
                    selectedItems.includes(item) && styles.tagSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedItems.includes(item) && styles.tagTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  categoryContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
  },
  tagSelected: {
    backgroundColor: '#A020F0',
  },
  tagText: {
    color: '#FFFFFF',
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default InterestSelector;
