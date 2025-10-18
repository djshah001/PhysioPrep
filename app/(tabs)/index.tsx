import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BentoHome from '~/home/BentoHome';

export default function HomePage() {
  // const [loading, setLoading] = useAtom(homeLoadingAtom);

  // const RenderSkeleton = () => (
  //   <View className="p-4">
  //     <View className="mb-6 h-12 rounded-2xl bg-card/50" />
  //     <View className="mb-6 h-24 rounded-2xl bg-card/50" />
  //     <View className="mb-6 flex-row justify-between">
  //       {[1, 2, 3].map((i) => (
  //         <View key={i} className="mx-1 h-20 flex-1 rounded-2xl bg-card/50" />
  //       ))}
  //     </View>
  //     <View className="mb-6 flex-row justify-between">
  //       {[1, 2, 3].map((i) => (
  //         <View key={i} className="mx-1 h-24 flex-1 rounded-2xl bg-card/50" />
  //       ))}
  //     </View>
  //     <View className="mb-6">
  //       {[1, 2].map((i) => (
  //         <View key={i} className="mb-4 h-20 rounded-2xl bg-card/50" />
  //       ))}
  //     </View>
  //   </View>
  // );

  // if (loading) {
  //   return (
  //     <ScrollView className="bg-background">
  //       <RenderSkeleton />
  //     </ScrollView>
  //   );
  // }
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <StatusBar barStyle="dark-content" />
      <BentoHome />
    </SafeAreaView>
  );
}
