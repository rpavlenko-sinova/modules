# Stable extension id

1. go to [itero](https://itero.plasmo.com/tools/generate-keypairs).
2. Press generate key pair.
3. Copy public key.
4. In package.json find manifest overrides at bottom.
5. Create inside of manifest override add key parameter with public key as value.

## Result should look like this

```
“manifest” : {
	// some existing values.
	“key”: public key value
}
```

This would make your ext have same id on every machine it installed.
