# Install instructions
1. Download or clone this repository, e.g. `git clone https://github.com/avimar/freeswitch-sounds-polly.git`
1. Copy Matthew-neural to your sounds path, e.g. debian: `cp -r freeswitch-sounds-polly/Matthew-neural /usr/share/freeswitch/sounds/en/us/matthew`
1. To ensure not just phrases and sounds, but also mod_say_en uses the new voice, make sure it allows you to specify a path dynamically. Edit `/usr/share/freeswitch/lang/en/en.xml` and remove `sound-prefix="$${sound_prefix}"`. There doesn't seem to be any downside. The default is still set in `vars.xml`
1. To switch the default voice:
	* For your entire system -- edit `/etc/freeswitch/vars.xml`
		* replace `<X-PRE-PROCESS cmd="set" data="sound_prefix=$${sounds_dir}/en/us/callie"/>`
		* with `<X-PRE-PROCESS cmd="set" data="sound_prefix=$${sounds_dir}/en/us/mattew"/>`
	* For just one channel, set:
		* `<action application="set" data="sound_prefix=$${sounds_dir}/en/us/matthew-reg/" />`



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