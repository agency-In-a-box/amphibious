# 🐸 Amphibious Local Development Setup

## Quick Start

Amphibious is now configured to run on **port 2960** (avoiding conflicts with your other projects on 5174 and 4030).

```bash
bun run dev
```

This will start the server at **http://localhost:2960**

## Custom Hostname Setup (Optional)

For a cleaner development experience, you can set up a custom hostname so you can access Amphibious at **http://amphibious.local:2960**.

### Automatic Setup

Run the setup script:

```bash
./setup-local-hostname.sh
```

You'll be prompted for your password to modify `/etc/hosts`.

### Manual Setup

If you prefer to set it up manually:

1. Open Terminal and edit your hosts file:
   ```bash
   sudo nano /etc/hosts
   ```

2. Add this line to the file:
   ```
   127.0.0.1       amphibious.local
   ```

3. Save and exit (Ctrl+X, Y, Enter in nano)

4. Now you can access Amphibious at **http://amphibious.local:2960**

## Access URLs

Once set up, you can use any of these URLs:

- **http://localhost:2960** (always works)
- **http://127.0.0.1:2960** (always works)
- **http://amphibious.local:2960** (after hostname setup)

## Why Port 2960?

Port 2960 is a tribute to the 960 Grid System that Amphibious is based on! It's also unlikely to conflict with other development servers.

## Removing the Hostname

To remove the custom hostname later:

1. Edit `/etc/hosts`:
   ```bash
   sudo nano /etc/hosts
   ```

2. Remove or comment out the line:
   ```
   # 127.0.0.1       amphibious.local
   ```

## Development Commands

```bash
bun run dev      # Start dev server (port 2960)
bun run build    # Build for production
bun run preview  # Preview production build (port 2961)
bun run lint     # Lint code
```

## Troubleshooting

### Port Already In Use
If port 2960 is already in use, you can temporarily use a different port:

```bash
bun run dev --port 2950
```

### Hostname Not Working
Make sure you:
1. Added the entry to `/etc/hosts` correctly
2. Used `sudo` when editing the hosts file
3. Cleared your browser cache
4. Tried accessing `http://amphibious.local:2960` (not https)

---

Happy coding! 🐸