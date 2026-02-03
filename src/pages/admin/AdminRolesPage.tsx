import { useState, useEffect } from 'react';
import { Shield, Edit2, Users, Search, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRoles {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  roles: string[];
}

const AVAILABLE_ROLES: { id: AppRole; label: string; description: string }[] = [
  { id: 'admin', label: 'Admin', description: 'Akses penuh ke semua fitur sistem' },
  { id: 'verifikator', label: 'Verifikator', description: 'Kelola verifikasi merchant dan komisi' },
  { id: 'merchant', label: 'Merchant', description: 'Kelola toko, produk, dan pesanan' },
  { id: 'courier', label: 'Kurir', description: 'Kelola pengiriman barang' },
  { id: 'admin_desa', label: 'Admin Desa', description: 'Kelola data wisata dan potensi desa' },
  { id: 'buyer', label: 'Pembeli', description: 'Akses standar untuk berbelanja' },
];

export default function AdminRolesPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = (profiles || []).map((profile) => {
        const userRoles = (roles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role);

        return {
          id: profile.user_id,
          full_name: profile.full_name || 'Unnamed User',
          phone: profile.phone,
          created_at: profile.created_at,
          roles: userRoles,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserWithRoles) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      // Use a cleaner approach for updating roles
      // 1. Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', editingUser.id);

      if (deleteError) throw deleteError;

      // 2. Insert new roles if any
      if (selectedRoles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(
            selectedRoles.map((role) => ({
              user_id: editingUser.id,
              role: role as AppRole,
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success(`Role untuk ${editingUser.full_name} berhasil diperbarui`);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving roles:', error);
      toast.error(error.message || 'Gagal menyimpan role');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery));
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'verifikator':
        return 'default';
      case 'merchant':
        return 'secondary';
      case 'courier':
        return 'outline';
      case 'admin_desa':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminLayout title="Manajemen Role" subtitle="Kelola hak akses dan peran pengguna sistem">
      <div className="space-y-6">
        {/* Role Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AVAILABLE_ROLES.map((role) => {
            const count = users.filter((u) => u.roles.includes(role.id)).length;
            const isActive = filterRole === role.id;
            return (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary border-primary' : ''}`}
                onClick={() => setFilterRole(isActive ? 'all' : role.id)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className={`p-2 rounded-full mb-2 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{role.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>Total {filteredUsers.length} pengguna ditemukan</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau telepon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[250px]"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter Role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-muted-foreground animate-pulse">Memuat data pengguna...</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[250px]">Nama Lengkap</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Role / Peran</TableHead>
                      <TableHead>Terdaftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {user.full_name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[180px]">{user.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {user.phone || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.length === 0 ? (
                                <Badge variant="outline" className="text-[10px] font-normal opacity-50">TIDAK ADA ROLE</Badge>
                              ) : (
                                user.roles.map((role) => (
                                  <Badge key={role} variant={getRoleBadgeVariant(role) as any} className="text-[10px] px-1.5 py-0">
                                    {AVAILABLE_ROLES.find((r) => r.id === role)?.label || role}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-10 w-10 mb-2 opacity-20" />
                            <p>Tidak ada pengguna ditemukan</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Edit Peran Pengguna
              </DialogTitle>
              <DialogDescription>
                Sesuaikan hak akses untuk <strong>{editingUser?.full_name}</strong>. 
                Pengguna dapat memiliki lebih dari satu peran.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-3 py-4">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
                      isSelected ? 'border-primary bg-primary/5' : 'bg-card'
                    }`}
                    onClick={() => toggleRole(role.id)}
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRole(role.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : ''}`}>
                          {role.label}
                        </p>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedRoles.includes('admin') && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs text-destructive-foreground">
                  <strong>Peringatan:</strong> Memberikan peran Admin akan memberikan akses penuh ke seluruh sistem, termasuk pengaturan keamanan dan data sensitif.
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                disabled={saving}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveRoles}
                disabled={saving}
                className="flex-1 sm:flex-none"
              >
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
