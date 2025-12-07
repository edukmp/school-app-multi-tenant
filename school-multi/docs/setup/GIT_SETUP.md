# Git Remote Setup Instructions

## Masalah
Error: "remote: Repository not found."

Repository yang dikonfigurasi tidak ada atau tidak dapat diakses.

## Solusi

### Opsi 1: Buat Repository Baru di GitHub (Recommended)

1. **Buat Repository di GitHub:**
   - Buka https://github.com/new
   - Nama repository: `school-app-multi-tenant` (atau nama lain)
   - Pilih Public atau Private
   - **JANGAN** centang "Initialize with README" (karena sudah ada local repo)
   - Klik "Create repository"

2. **Update Remote URL:**
   
   Ganti `YOUR_USERNAME` dengan username GitHub Anda:
   
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/school-app-multi-tenant.git
   ```
   
   Contoh:
   ```bash
   git remote set-url origin https://github.com/johndoe/school-app-multi-tenant.git
   ```

3. **Verify:**
   ```bash
   git remote -v
   ```

4. **Push ke GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Opsi 2: Hapus Remote (Jika tidak perlu push ke GitHub)

Jika Anda hanya ingin development lokal tanpa remote repository:

```bash
git remote remove origin
```

### Opsi 3: Clone dari Repository yang Benar

Jika repository sudah ada di tempat lain dengan URL yang berbeda:

```bash
git remote set-url origin https://github.com/CORRECT_USERNAME/CORRECT_REPO.git
```

## Cek Status Saat Ini

```bash
# Cek remote saat ini
git remote -v

# Cek branch
git branch

# Cek status
git status
```

## Authentication

Jika menggunakan HTTPS, GitHub mungkin meminta authentication:
- Username GitHub Anda
- Personal Access Token (PAT) sebagai password
  
Cara membuat PAT:
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Pilih scope: `repo` (full control of private repositories)
4. Copy token dan gunakan sebagai password saat git push

Atau gunakan SSH:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/school-app-multi-tenant.git
```

## Current Remote URL
```
https://github.com/ekamamgifeng/school-app-multi-tenant.git
```

Pastikan repository ini:
- ✓ Sudah dibuat di GitHub
- ✓ Anda punya akses ke repository
- ✓ URL-nya benar
