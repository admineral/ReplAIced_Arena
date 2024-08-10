import AttackMain from "@/components/Attack_components/AttackMain";

interface PageProps {
  searchParams: {
    attackerId?: string;
    attackerBoxId?: string;
    defenderId?: string;
    defenderBoxId?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  const { attackerId, attackerBoxId, defenderId, defenderBoxId } = searchParams;

  return (
    <AttackMain 
      attackerId={attackerId}
      attackerBoxId={attackerBoxId}
      defenderId={defenderId}
      defenderBoxId={defenderBoxId}
    />
  );
}