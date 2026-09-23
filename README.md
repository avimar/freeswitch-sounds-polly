# Install instructions for English US Matthew
1. Download or clone this repository, e.g. `git clone https://github.com/avimar/freeswitch-sounds-polly.git`
1. Ensure the new folder is available: `mkdir /usr/share/freeswitch/sounds/en/us/matthew`
1. Copy Matthew-neural (or Matthew-standard) to your sounds path, e.g. debian: `cp -r freeswitch-sounds-polly/Matthew-neural /usr/share/freeswitch/sounds/en/us/matthew`
	* For a mix of neural for phrases and standard for single-words use this:
	* `cd freeswitch-sounds-polly;`
	* `rsync -av --exclude-from=better-as-standard.txt Matthew-neural/ /usr/share/freeswitch/sounds/en/us/matthew;`
	* `rsync -av --exclude-from=better-as-neural.txt Matthew-standard/ /usr/share/freeswitch/sounds/en/us/matthew;`

1. For Hebrew, see [Hebrew (Israel) - Avri](#hebrew-israel---avri) below.


1. To ensure not just phrases and sounds, but also mod_say_en uses the new voice, make sure it allows you to specify a path dynamically. Edit `/usr/share/freeswitch/lang/en/en.xml` and remove `sound-prefix="$${sound_prefix}"`. There doesn't seem to be any downside. The default is still set in `vars.xml`
1. To switch the default voice:
	* For your entire system -- edit `/etc/freeswitch/vars.xml`
		* replace `<X-PRE-PROCESS cmd="set" data="sound_prefix=$${sounds_dir}/en/us/callie"/>`
		* with `<X-PRE-PROCESS cmd="set" data="sound_prefix=$${sounds_dir}/en/us/mattew"/>`
	* For just one channel, set:
		* `<action application="set" data="sound_prefix=$${sounds_dir}/en/us/matthew-reg" />`
	* For hebrew just one channel, set:
		* `<action application="set" data="sound_prefix=$${sounds_dir}/he/il/avri" />`


# Hebrew (Israel) - Avri
`he-avri/` is a Hebrew set for `mod_say_he`: every file it plays for numbers, currency (shekel/agorot) and time, plus a few `ivr` prompts. The voice is Azure `he-IL-AvriNeural` (Polly has no Hebrew voice), at 8000, 16000 and 24000 Hz.

Install:
1. Copy it to your sounds path, e.g. debian: `mkdir -p /usr/share/freeswitch/sounds/he/il && cp -r he-avri /usr/share/freeswitch/sounds/he/il/avri`
1. In `lang/he/he.xml`, point the language at it: `<language name="he" say-module="he" sound-prefix="$${sounds_dir}/he/il/avri">`
1. Use a `mod_say_he` with the grammar fixes from [signalwire/freeswitch#3186](https://github.com/signalwire/freeswitch/pull/3186). The older module says some numbers wrong (extra or missing "and", "שניים מיליון", "שעה שלוש" for 3 hours).

Every file was checked by ear, joined in the order `mod_say_he` plays them.

Generate more files in the same voice:
1. Put `azure_key` and `azure_region` in `creds.ini`, and run `npm install`. You also need `ffmpeg` on PATH.
1. Write a list of `[text, file name, folder, rate]` rows, like [`azure/he-say-missing.js`](azure/he-say-missing.js). Rate is optional; the default is `+20%`, which the whole set uses.
1. `node azure/generate-he.js make <your-list.js>`. It saves the 24000 file as Azure returns it, and trimmed 16000 and 8000 copies. Existing files are skipped.

Tips from building this set:
- Write the text with nikkud. Plain spelling sometimes reads better (`דקות`, `שתיים`), so try both.
- Listen to a new file joined to its neighbours, not alone. [`azure/he-say-variants.js`](azure/he-say-variants.js) has the retakes and which one was chosen.
- The "and" prefixes (`digits/va`, `ve`, `uu`) are recorded alone. Cutting them from the front of a whole word sounded worse.
- `node azure/generate-he.js retrim` rebuilds the 16000 and 8000 copies from 24000.

Azure terms (checked 2026-09-24, [Product Terms](https://www.microsoft.com/licensing/terms/productoffering/MicrosoftAzure/allprograms), Foundry Tools > Text-to-Speech):
- **Output use needs the paid tier.** "For Customers of the paid tier TTS Service only, Customer may use the audio output of prebuilt neural voices ... including for commercial purposes." The free tier (F0) gets no output rights. Some older files may have been made on the free trial; the tier was not checked. Check the Speech resource's pricing tier before relying on this set.
- **No training.** "Customer will not use and will not allow third parties to use ... data from Foundry Tools to create, train, or improve ... a similar or competing product or service." So an open license like CC BY-SA (which allows anything) does not fit.
- **Disclose it is synthetic** ([AI Code of Conduct](https://learn.microsoft.com/en-us/legal/ai-code-of-conduct)).
- Not offered to [freeswitch/freeswitch-sounds](https://github.com/freeswitch/freeswitch-sounds) for now. That would need: paid tier, regenerate at 48000 (their masters), a license with the no-training limit, and their OK for a set that covers only mod_say_he.

# Information
Goal: Generate FreeSWITCH sound files using Amazon Polly.

Motivation:
 - If you have a whole sound set, you can generate new sounds when you want that sound consistent with the others
 - Why now?
   - Polly licence allows you to re-use the files
     >Q. Can I use the service for generating static voice prompts that will be replayed multiple times?
     >Yes, you can. The service does not restrict this and there are no additional costs for doing so. https://aws.amazon.com/polly/faqs/

     > You can cache and save Polly’s speech audio to replay offline or redistribute. https://docs.aws.amazon.com/whitepapers/latest/aws-overview/machine-learning.html
    - Voices, especially Neural, are pretty high quality
    - Multiple languages with the same API
    - Pretty cheap
 
Limitations:
 - Highest quality sounds they produce is only 24000, whereas FreeSWITCH sounds come with 48000.
 
Contributing:
- Audiophile/knowledge: How to get the best audio quality?
    - 24000 only comes from OGG/MP3, but we want WAV/PCM for raw audio -- we should convert -- from mp3 or ogg?
    - Is downsampling 16000 PCM to 8000 with sox just as good as re-generating at 8000?
    - If you're an audiophile or know how FreeSWITCH handles audio, check the various files in the conference folder.
- FreeSWICH testing: Test mod_say for numbers and currencies.
   - Do the files flow together?
   - If so, how do we fix it? And automate it? Maybe the non-neural ones are better for numbers?
 
How to generate more audio:
- You'll need to save your amazon credentials in `creds.ini`
- Run `npm install`
- Make a list, or a single file, and pass it to the function.
- Modify any other options of the voice, format, sample rate.
- run `node generate.js`
 
TODO:
- Only generate the files that are missing
- Better "API" to use
