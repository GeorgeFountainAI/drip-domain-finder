import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface UserWithCredits {
  user_id: string;
  email: string;
  current_credits: number;
  total_purchased_credits: number;
  is_admin: boolean;
  created_at: string;
}

export const AdminCreditsPanel = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creditInputs, setCreditInputs] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_credits');
      
      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const updateCredits = async (userId: string, creditChange: number) => {
    if (creditChange === 0) return;

    setUpdating(userId);
    try {
      const { data, error } = await supabase.rpc('admin_update_user_credits', {
        target_user_id: userId,
        credit_change: creditChange
      });

      if (error) {
        throw error;
      }

      // Parse the JSON response
      const result = data as { success: boolean; new_credits: number; credit_change: number };

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, current_credits: result.new_credits }
          : user
      ));

      // Clear input
      setCreditInputs(prev => ({ ...prev, [userId]: '' }));

      toast({
        title: "Credits Updated",
        description: `${creditChange > 0 ? 'Added' : 'Removed'} ${Math.abs(creditChange)} credits`,
      });
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: "Error",
        description: "Failed to update credits",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleCreditInputChange = (userId: string, value: string) => {
    setCreditInputs(prev => ({ ...prev, [userId]: value }));
  };

  const handleQuickAdd = (userId: string, amount: number) => {
    updateCredits(userId, amount);
  };

  const handleManualUpdate = (userId: string) => {
    const inputValue = creditInputs[userId];
    if (!inputValue) return;
    
    const creditChange = parseInt(inputValue);
    if (isNaN(creditChange)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    updateCredits(userId, creditChange);
  };

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Credits Management</h1>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>All Users</span>
              <Badge variant="secondary">{users.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.user_id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.email}</span>
                        {user.is_admin && (
                          <Badge variant="destructive" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Credits: <span className="font-medium">{user.current_credits}</span>
                        {user.total_purchased_credits > 0 && (
                          <span className="ml-2">
                            (Purchased: {user.total_purchased_credits})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Quick actions */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdd(user.user_id, -10)}
                        disabled={updating === user.user_id}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdd(user.user_id, 10)}
                        disabled={updating === user.user_id}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      {/* Manual input */}
                      <Input
                        type="number"
                        placeholder="±Credits"
                        value={creditInputs[user.user_id] || ''}
                        onChange={(e) => handleCreditInputChange(user.user_id, e.target.value)}
                        className="w-24 h-8"
                        disabled={updating === user.user_id}
                      />
                      
                      <Button
                        size="sm"
                        onClick={() => handleManualUpdate(user.user_id)}
                        disabled={updating === user.user_id || !creditInputs[user.user_id]}
                        className="h-8"
                      >
                        {updating === user.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Update'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};