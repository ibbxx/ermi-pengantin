#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

branch="$(git branch --show-current)"
if [[ "$branch" != "main" ]]; then
  echo "Gagal: script hanya boleh dijalankan dari branch main (saat ini: $branch)." >&2
  exit 1
fi

echo "Remote: $(git remote get-url origin)"
echo "Commit lokal: $(git rev-parse --short HEAD)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Peringatan: ada perubahan lokal yang belum di-commit; perubahan itu tidak ikut dipush."
fi

git push origin main

local_sha="$(git rev-parse HEAD)"
remote_sha="$(git ls-remote origin refs/heads/main | awk '{print $1}')"
if [[ "$local_sha" != "$remote_sha" ]]; then
  echo "Gagal verifikasi: origin/main ($remote_sha) berbeda dari HEAD ($local_sha)." >&2
  exit 1
fi

echo "Berhasil: origin/main sekarang $remote_sha"
