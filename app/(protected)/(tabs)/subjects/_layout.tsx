import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { CustomHeader } from 'components/common/CustomHeader';
import { Colors } from 'constants/Colors';


export default function SubjectsLayout() {
  const { user } = useAuth();
  const router = useRouter();
  // const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        // headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        // header: () => <CustomHeader title="Subjects" leftIcons={[{
        //   name: 'add',
        //   onPress: () => router.push('/subjects/add'),
        //   color: Colors.primary,
        // }]} />,
      }}>
      <Stack.Screen
        name="index"
        options={{
          // headerShown: false,
          header: () => (
            <CustomHeader
              title="Subjects"
              rightIcons={
                user?.role === 'admin'
                  ? [
                      {
                        name: 'add',
                        onPress: () => router.push('/subjects/add'),
                        color: Colors.primary,
                      },
                    ]
                  : []
              }
            />
          ),
          // headerTransparent: true,
          // headerBackground: () => <HeaderBlurView height={insets.top + 60} />,
          
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          // headerShown: false,
          header: () => <CustomHeader title="Add Subject" showBack />,
          // headerTransparent: true,
          // headerBackground: () => <HeaderBlurView height={insets.top + 60} />,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
