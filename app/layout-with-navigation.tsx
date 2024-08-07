import NavigationWrapper from '../components/ControlPanel/NavigationWrapper';

export default function LayoutWithNavigation({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  );
}