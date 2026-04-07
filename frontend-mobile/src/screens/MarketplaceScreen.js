import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, TextInput
} from 'react-native';
import { fetchGems } from '../services/api';

export default function MarketplaceScreen({ navigation }) {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadGems();
  }, []);

  const loadGems = async () => {
    try {
      const res = await fetchGems();
      setGems(res.data);
    } catch (err) {
      console.error('Error loading gems:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = gems.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.gem_type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6b46c1" />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search gems..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GemDetail', { gem: item })}
          >
            <Image
              source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.gem_type} · {item.weight_carats} ct</Text>
              <Text style={styles.price}>LKR {item.base_price.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 12 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search:    {
    backgroundColor: '#fff', borderRadius: 10, padding: 10,
    marginBottom: 12, borderWidth: 1, borderColor: '#ddd'
  },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    marginBottom: 12, padding: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3
  },
  image:  { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  info:   { flex: 1, justifyContent: 'center' },
  name:   { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  type:   { fontSize: 13, color: '#666', marginVertical: 4 },
  price:  { fontSize: 15, fontWeight: '600', color: '#6b46c1' },
});