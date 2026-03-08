---
name: weather
description: Get current weather and forecasts (no API key required).
homepage: https://wttr.in/:help
---

# Weather Skill

Get current weather and forecasts using wttr.in service (no API key required).

## Features

- Get current weather for any location
- Compact format for quick checks
- Full forecast with temperature, humidity, wind
- No API key required (free service)

## Usage

### Quick check (one-liner)
```bash
curl -s "wttr.in/Shanghai?format=3"
# Output: Shanghai: ⛅️ +8°C
```

### Compact format
```bash
curl -s "wttr.in/Shanghai?format=%l:+%c+%t+%h+%w"
# Output: Shanghai: ⛅️ +8°C 71% ↙5km/h
```

### Full forecast
```bash
curl -s "wttr.in/Shanghai?T"
```

### With specific format codes
- `%c` - weather condition
- `%t` - temperature
- `%h` - humidity
- `%w` - wind
- `%l` - location
- `%m` - moon phase

## Examples

### Check weather in different cities
```bash
# Beijing
curl -s "wttr.in/Beijing?format=3"

# New York
curl -s "wttr.in/New+York?format=3"

# Shanghai
curl -s "wttr.in/Shanghai?format=3"
```

### Get weather image
```bash
curl -s "wttr.in/Beijing.png" -o weather.png
```

## Tips

- **URL-encode spaces**: Use `+` or `%20` for spaces in city names
- **Airport codes**: Works with airport codes (e.g., `JFK`, `PEK`)
- **Units**:
  - Metric: `?m` (default)
  - USCS: `?u` (Fahrenheit, mph)
- **Time range**:
  - Today only: `?1`
  - Current only: `?0`

## API Reference

For complete documentation: https://wttr.in/:help

---

**Installed**: 2026-03-09
**Source**: https://wttr.in
