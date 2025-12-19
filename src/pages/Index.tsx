import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

type Rarity = 'legendary' | 'epic' | 'rare' | 'common';

interface WeaponSkin {
  id: number;
  name: string;
  weapon: string;
  rarity: Rarity;
  price: number;
  image: string;
  owned: boolean;
}

interface PlayerStats {
  level: number;
  rank: string;
  wins: number;
  kills: number;
  kd: number;
  winRate: number;
}

const weaponSkins: WeaponSkin[] = [
  { id: 1, name: 'Dragon Lore', weapon: 'AWP', rarity: 'legendary', price: 2500, image: '🐉', owned: false },
  { id: 2, name: 'Howl', weapon: 'M4A4', rarity: 'legendary', price: 2200, image: '🐺', owned: false },
  { id: 3, name: 'Fire Serpent', weapon: 'AK-47', rarity: 'epic', price: 1800, image: '🔥', owned: true },
  { id: 4, name: 'Asiimov', weapon: 'AWP', rarity: 'epic', price: 850, image: '⚡', owned: true },
  { id: 5, name: 'Redline', weapon: 'AK-47', rarity: 'rare', price: 450, image: '🎯', owned: true },
  { id: 6, name: 'Vulcan', weapon: 'AK-47', rarity: 'rare', price: 650, image: '💫', owned: false },
  { id: 7, name: 'Cyrex', weapon: 'M4A1-S', rarity: 'rare', price: 520, image: '🌀', owned: false },
  { id: 8, name: 'Hyper Beast', weapon: 'M4A1-S', rarity: 'epic', price: 920, image: '👾', owned: false },
];

const playerStats: PlayerStats = {
  level: 47,
  rank: 'Global Elite',
  wins: 1247,
  kills: 15832,
  kd: 1.84,
  winRate: 62.3,
};

const getRarityColor = (rarity: Rarity): string => {
  const colors = {
    legendary: 'text-legendary border-legendary',
    epic: 'text-epic border-epic',
    rare: 'text-rare border-rare',
    common: 'text-common border-common',
  };
  return colors[rarity];
};

const getRarityBg = (rarity: Rarity): string => {
  const colors = {
    legendary: 'bg-legendary/10',
    epic: 'bg-epic/10',
    rare: 'bg-rare/10',
    common: 'bg-common/10',
  };
  return colors[rarity];
};

export default function Index() {
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');
  const [balance] = useState(5000);

  const filteredSkins = selectedRarity === 'all' 
    ? weaponSkins 
    : weaponSkins.filter(skin => skin.rarity === selectedRarity);

  const ownedSkins = weaponSkins.filter(skin => skin.owned);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Target" size={28} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">COMBAT STRIKE</h1>
                <p className="text-sm text-muted-foreground">Tactical Shooter</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
                <Icon name="Coins" size={20} className="text-primary" />
                <span className="font-semibold">${balance}</span>
              </div>
              <Button variant="outline" size="sm">
                <Icon name="Settings" size={18} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="shop" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
            <TabsTrigger value="shop" className="text-base">
              <Icon name="ShoppingCart" size={18} className="mr-2" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-base">
              <Icon name="Package" size={18} className="mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-base">
              <Icon name="User" size={18} className="mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Weapon Skins</h2>
              <div className="flex gap-2">
                <Button
                  variant={selectedRarity === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedRarity === 'legendary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('legendary')}
                  className={selectedRarity === 'legendary' ? 'bg-legendary hover:bg-legendary/90' : ''}
                >
                  Legendary
                </Button>
                <Button
                  variant={selectedRarity === 'epic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('epic')}
                  className={selectedRarity === 'epic' ? 'bg-epic hover:bg-epic/90' : ''}
                >
                  Epic
                </Button>
                <Button
                  variant={selectedRarity === 'rare' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity('rare')}
                  className={selectedRarity === 'rare' ? 'bg-rare hover:bg-rare/90' : ''}
                >
                  Rare
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSkins.map((skin) => (
                <Card
                  key={skin.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    getRarityBg(skin.rarity)
                  } border-2 ${getRarityColor(skin.rarity)} ${
                    skin.rarity === 'legendary' ? 'animate-pulse-glow' : ''
                  }`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getRarityColor(skin.rarity)}>
                        {skin.rarity.toUpperCase()}
                      </Badge>
                      {skin.owned && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500">
                          <Icon name="Check" size={14} className="mr-1" />
                          Owned
                        </Badge>
                      )}
                    </div>

                    <div className="aspect-square flex items-center justify-center text-8xl">
                      {skin.image}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-1">{skin.name}</h3>
                      <p className="text-sm text-muted-foreground">{skin.weapon}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Icon name="Coins" size={18} className="text-primary" />
                        <span className="font-bold text-lg">${skin.price}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={skin.owned}
                        className={skin.owned ? '' : 'bg-primary hover:bg-primary/90'}
                      >
                        {skin.owned ? 'Owned' : 'Buy'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">My Inventory</h2>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {ownedSkins.length} Items
              </Badge>
            </div>

            {ownedSkins.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Package" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-2">No Items Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Visit the shop to purchase your first weapon skin
                </p>
                <Button>Go to Shop</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ownedSkins.map((skin) => (
                  <Card
                    key={skin.id}
                    className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                      getRarityBg(skin.rarity)
                    } border-2 ${getRarityColor(skin.rarity)}`}
                  >
                    <div className="p-6 space-y-4">
                      <Badge variant="outline" className={getRarityColor(skin.rarity)}>
                        {skin.rarity.toUpperCase()}
                      </Badge>

                      <div className="aspect-square flex items-center justify-center text-8xl">
                        {skin.image}
                      </div>

                      <div>
                        <h3 className="font-bold text-xl mb-1">{skin.name}</h3>
                        <p className="text-sm text-muted-foreground">{skin.weapon}</p>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Icon name="Eye" size={16} className="mr-2" />
                        Inspect
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="p-8 bg-gradient-to-br from-card to-secondary/20">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-xl bg-primary flex items-center justify-center">
                  <Icon name="User" size={48} className="text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">Player</h2>
                    <Badge className="bg-legendary text-white border-0">
                      {playerStats.rank}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">Level {playerStats.level}</p>
                  <Progress value={(playerStats.level % 10) * 10} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {((playerStats.level % 10) * 10)}% to Level {playerStats.level + 1}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 text-center hover:bg-secondary/50 transition-colors">
                <Icon name="Trophy" size={32} className="mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-1">{playerStats.wins}</p>
                <p className="text-sm text-muted-foreground">Total Wins</p>
              </Card>

              <Card className="p-6 text-center hover:bg-secondary/50 transition-colors">
                <Icon name="Target" size={32} className="mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-1">{playerStats.kills.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Kills</p>
              </Card>

              <Card className="p-6 text-center hover:bg-secondary/50 transition-colors">
                <Icon name="Zap" size={32} className="mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-1">{playerStats.kd}</p>
                <p className="text-sm text-muted-foreground">K/D Ratio</p>
              </Card>

              <Card className="p-6 text-center hover:bg-secondary/50 transition-colors">
                <Icon name="Percent" size={32} className="mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold mb-1">{playerStats.winRate}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Award" size={24} className="text-primary" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'First Blood Master', desc: 'Get 100 first kills', progress: 100 },
                  { name: 'Headshot King', desc: 'Land 500 headshots', progress: 78 },
                  { name: 'Ace Collector', desc: 'Get 50 aces', progress: 42 },
                ].map((achievement, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                      </div>
                      <Badge variant={achievement.progress === 100 ? 'default' : 'secondary'}>
                        {achievement.progress}%
                      </Badge>
                    </div>
                    <Progress value={achievement.progress} />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
