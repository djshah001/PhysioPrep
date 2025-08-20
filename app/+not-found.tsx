import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/useAuth';

export default function NotFoundScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center p-5 bg-background">
      <Text className="text-4xl font-bold text-primary mb-4">404</Text>
      <Text className="text-xl text-primary mb-8">Page Not Found</Text>
      <TouchableOpacity 
        onPress={() => router.back()}
        className="bg-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-primary-foreground font-medium">Go Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => logout()}
        className="bg-primary px-6 py-3 rounded-lg my-4"
      >
        <Text className="text-primary-foreground font-medium">sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
