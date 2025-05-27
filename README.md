# Odometer

A lightweight and slightly customizable JavaScript odometer library.

---

## ⚙️⋮ Installation

Include a `<script>` tag for this library

```html
<script src="https://bradydallama.github.io/odometer/odometer.js"></script>
```

## 📝⋮ Usage

Add the `odometer` class to any element to give it odometer functionality.

Use `element.setOdometer(value: number)` to update the odometer.

Commas, decimals, and end units are supported (for something like 5,235.2K).

### Odomter Customization:

Apply these data tags to each element.
| Attribute | Description | Example | Default |
|------------------|-------------------------------------------------------------------------|----------------------|---------------|
| `data-duration` | Duration of the digit animation in milliseconds | `data-duration="500"`| 400 |
| `data-reduce-motion` | Disable the squishy scroll animation and just use a normal odometer scroll | `data-reduce-motion="true"`| false |
