---
title: "MADE: A Living Benchmark for Multi-Label Text Classification with Uncertainty Quantification of Medical Device Adverse Events"
subtitle: Multi-label classification where uncertainty quantification counts as much as accuracy.
description: >-
  MADE (ACL 2026) is a living benchmark for multi-label classification of FDA
  medical device adverse event reports, scoring 20+ encoder and decoder LLMs on
  accuracy and uncertainty quantification together.
keywords:
  - multi-label text classification
  - uncertainty quantification
  - medical device adverse events
  - IMDRF codes
  - FDA MAUDE
  - large language models
  - benchmark
  - ACL 2026
---

[MADE](https://aclanthology.org/2026.acl-long.2148/) (ACL 2026) is a benchmark
for multi-label classification of medical device adverse event reports. In a
domain where model output feeds human review, being right is not enough: the
model also has to signal when it is likely wrong. MADE scores predictive
performance and uncertainty quantification side by side.

## The data: 488k FDA MAUDE reports, 1,154 IMDRF codes

488,273 reports from the FDA's MAUDE adverse event database, 2015 to
mid-2025, labelled with 1,154 IMDRF codes over three levels and up-propagated to
parent codes. About 8.79 labels per report, roughly 370 tokens each, with a long
tail of rare codes. Splits are strictly temporal: 298,825 training reports from
2015 to 2023, 71,271 for validation from the first half of 2024, and 10,288 for
testing from July 2024 to June 2025. The benchmark is *living*, refreshed
quarterly, so the test set always post-dates whatever a model saw in
pretraining.

## The setup: 20+ models, three paradigms, six uncertainty signals

20+ encoder and decoder models, three learning paradigms, and six
uncertainty signals, evaluated as one grid.

<figure>
  <svg class="chart" viewBox="0 0 720 754" role="img"
       style="display:block;width:100%;height:auto"
       aria-label="Pipeline diagram. Discriminative and generative language models feed three learning paradigms, discriminative fine-tuning, generative fine-tuning and few-shot prompting, which feed six uncertainty signals: entropy, perplexity, max token logprob, mean token logprob, Laplacian eigenvalues and self-verbalized confidence. Below, a worked example: an FDA report about a jet lavage device whose battery exploded in its packaging before surgery, and its nine IMDRF labels: A02, manufacturing, packaging or shipping problem; A0207, device damaged prior to receipt by user; A020701, delivered as unsterile product; A04, material integrity problem; A0403, explosion; A07, electrical / electronic property problem; A0705, battery problem; E24, other terms related to clinical signs, symptoms or conditions; E2403, no clinical signs, symptoms or conditions.">
    <defs>
      <pattern id="made-lo" width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="0.9" fill="var(--fg-muted)"/>
      </pattern>
      <pattern id="made-mid" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.9" fill="var(--fg-muted)"/>
      </pattern>
      <pattern id="made-hi" width="3" height="3" patternUnits="userSpaceOnUse">
        <circle cx="0.8" cy="0.8" r="0.8" fill="var(--fg-muted)"/>
        <circle cx="2.2" cy="2.2" r="0.8" fill="var(--fg-muted)"/>
      </pattern>
      <pattern id="made-ink" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.9" fill="var(--fg-muted)"/>
        <circle cx="3" cy="3" r="0.9" fill="var(--fg-muted)"/>
      </pattern>
      <marker id="made-arrow" viewBox="0 0 8 8" refX="7" refY="4"
              markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,1 L7,4 L0,7 z" fill="var(--fg-muted)"/>
      </marker>
    </defs>

    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg-muted)"
       letter-spacing="0.08em">
      <text x="8" y="18">01 · LANGUAGE MODELS</text>
      <text x="266" y="18">02 · PARADIGMS</text>
      <text x="486" y="18">03 · UNCERTAINTY</text>
    </g>

    <g fill="none" stroke="var(--border)" stroke-width="1">
      <rect x="8" y="28" width="216" height="272"/>
      <rect x="266" y="28" width="164" height="272"/>
      <rect x="486" y="28" width="226" height="272"/>
    </g>

    <g fill="url(#made-ink)">
      <rect x="8" y="28" width="216" height="6"/>
      <rect x="266" y="28" width="164" height="6"/>
      <rect x="486" y="28" width="226" height="6"/>
    </g>

    <g stroke="var(--fg)" stroke-width="1" fill="var(--bg-code)">
      <rect x="24" y="48" width="184" height="110"/>
      <rect x="24" y="176" width="184" height="108"/>
    </g>

    <g font-family="var(--font-mono)" fill="var(--fg)">
      <text x="36" y="70" font-size="12" font-weight="600">discriminative</text>
      <g font-size="11" fill="var(--fg-2)">
        <text x="36" y="92">Ettin-encoder 150m</text>
        <text x="36" y="110">Ettin-encoder 400m / 1B</text>
        <text x="36" y="128">Llama-3.2 1B / 3B</text>
        <text x="36" y="146">...</text>
      </g>
      <text x="36" y="198" font-size="12" font-weight="600">generative</text>
      <g font-size="11" fill="var(--fg-2)">
        <text x="36" y="220">Ettin-decoder-1B</text>
        <text x="36" y="238">Llama-3.1 8B / 70B</text>
        <text x="36" y="256">Qwen3-235B · DeepSeek-R1</text>
        <text x="36" y="274">GPT-4.1 · GPT-5</text>
      </g>
    </g>

    <g stroke="var(--fg)" stroke-width="1" fill="var(--bg-code)">
      <rect x="282" y="58" width="132" height="58"/>
      <rect x="282" y="136" width="132" height="58"/>
      <rect x="282" y="214" width="132" height="58"/>
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg)"
       text-anchor="middle">
      <text x="348" y="82">discriminative</text>
      <text x="348" y="98">fine-tuning</text>
      <text x="348" y="160">generative</text>
      <text x="348" y="176">fine-tuning</text>
      <text x="348" y="238">few-shot</text>
      <text x="348" y="254">prompting</text>
    </g>

    <g stroke="var(--fg)" stroke-width="1" fill="none">
      <rect x="502" y="48" width="194" height="34"/>
      <rect x="502" y="90" width="194" height="34"/>
      <rect x="502" y="132" width="194" height="34"/>
      <rect x="502" y="174" width="194" height="34"/>
      <rect x="502" y="216" width="194" height="34"/>
      <rect x="502" y="258" width="194" height="34"/>
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg)">
      <text x="516" y="69">entropy</text>
      <text x="516" y="111">perplexity</text>
      <text x="516" y="153">max token logprob</text>
      <text x="516" y="195">mean token logprob</text>
      <text x="516" y="237">Laplacian eigenvalues</text>
      <text x="516" y="279">self-verbalized</text>
    </g>

    <g stroke="var(--fg-muted)" stroke-width="1" fill="none"
       marker-end="url(#made-arrow)">
      <line x1="208" y1="100" x2="280" y2="87"/>
      <line x1="208" y1="222" x2="280" y2="87"/>
      <line x1="208" y1="230" x2="280" y2="165"/>
      <line x1="208" y1="238" x2="280" y2="243"/>
      <line x1="414" y1="87" x2="500" y2="65"/>
      <line x1="414" y1="152" x2="500" y2="65"/>
      <line x1="414" y1="159" x2="500" y2="107"/>
      <line x1="414" y1="165" x2="500" y2="149"/>
      <line x1="414" y1="172" x2="500" y2="191"/>
      <line x1="414" y1="179" x2="500" y2="233"/>
      <line x1="414" y1="230" x2="500" y2="107"/>
      <line x1="414" y1="237" x2="500" y2="149"/>
      <line x1="414" y1="243" x2="500" y2="191"/>
      <line x1="414" y1="250" x2="500" y2="233"/>
      <line x1="414" y1="257" x2="500" y2="275"/>
    </g>

    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg-muted)"
       letter-spacing="0.08em">
      <text x="8" y="346">04 · ONE REPORT IN</text>
    </g>
    <g fill="none" stroke="var(--border)" stroke-width="1">
      <rect x="8" y="356" width="704" height="140"/>
    </g>
    <g fill="url(#made-ink)"><rect x="8" y="356" width="704" height="6"/></g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg-2)">
      <text x="24" y="388">Device Information: lavage, jet (fan spray kit; zimmer surgical, inc.)</text>
      <text x="24" y="404">operated by health professional</text>
      <text x="24" y="420">Event Type: malfunction</text>
      <text x="24" y="436">Description of Event: it was reported that before surgery, there was an explosion of</text>
      <text x="24" y="452">the battery in the packaging. the device was discovered like this in the surgery room</text>
      <text x="24" y="468">on opening the box. there was no patient involvement. due diligence is complete, no</text>
      <text x="24" y="484">further information is available.</text>
    </g>

    <g stroke="var(--fg-muted)" stroke-width="1" fill="none"
       marker-end="url(#made-arrow)">
      <path d="M360,496 L360,528"/>
    </g>

    <g font-family="var(--font-mono)" font-size="11" fill="var(--fg-muted)"
       letter-spacing="0.08em">
      <text x="8" y="546">05 · LABELS OUT, WITH UNCERTAINTY</text>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--fg-2)"
       text-anchor="end">
      <text x="712" y="546">denser dither = less certain</text>
    </g>
    <g fill="none" stroke="var(--border)" stroke-width="1">
      <rect x="8" y="556" width="704" height="190"/>
    </g>
    <g fill="url(#made-ink)"><rect x="8" y="556" width="704" height="6"/></g>

    <g font-family="var(--font-mono)">
      <g class="chip">
        <rect x="56" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="88" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A02</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A02 &#183; manufacturing, packaging or shipping problem</text>
      </g>
      <g class="chip">
        <rect x="128" y="572" width="64" height="24" fill="url(#made-mid)" stroke="var(--fg)" stroke-width="1"/>
        <text x="160" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A0207</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A0207 &#183; device damaged prior to receipt by user</text>
      </g>
      <g class="chip">
        <rect x="200" y="572" width="64" height="24" fill="url(#made-hi)" stroke="var(--fg)" stroke-width="1"/>
        <text x="232" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A020701</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A020701 &#183; delivered as unsterile product</text>
      </g>
      <g class="chip">
        <rect x="272" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="304" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A04</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A04 &#183; material integrity problem</text>
      </g>
      <g class="chip">
        <rect x="344" y="572" width="64" height="24" fill="url(#made-mid)" stroke="var(--fg)" stroke-width="1"/>
        <text x="376" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A0403</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A0403 &#183; explosion</text>
      </g>
      <g class="chip">
        <rect x="416" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="448" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A07</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A07 &#183; electrical / electronic property problem</text>
      </g>
      <g class="chip">
        <rect x="488" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="520" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">A0705</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">A0705 &#183; battery problem</text>
      </g>
      <g class="chip">
        <rect x="560" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="592" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">E24</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">E24 &#183; other terms related to clinical signs, symptoms or conditions</text>
      </g>
      <g class="chip">
        <rect x="632" y="572" width="64" height="24" fill="url(#made-lo)" stroke="var(--fg)" stroke-width="1"/>
        <text x="664" y="588" text-anchor="middle" font-size="11" fill="var(--fg)">E2403</text>
        <text class="chip-def" x="56" y="736" font-size="11" fill="var(--fg)">E2403 &#183; no clinical signs, symptoms or conditions</text>
      </g>
      <text class="chip-hint" x="56" y="736" font-family="var(--font-mono)"
            font-size="11" fill="var(--fg-muted)">hover a label for its definition</text>
    </g>

    <g stroke="var(--border)" stroke-width="1">
      <line x1="56" y1="612" x2="700" y2="612"/>
      <line x1="56" y1="652" x2="700" y2="652"/>
      <line x1="56" y1="692" x2="700" y2="692"/>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--fg-muted)"
       text-anchor="end">
      <text x="48" y="616">1.0</text>
      <text x="48" y="656">0.5</text>
      <text x="48" y="696">0.0</text>
    </g>
    <g stroke="var(--fg)" stroke-width="1">
      <rect x="70" y="686" width="36" height="6" fill="url(#made-lo)"/>
      <rect x="142" y="664" width="36" height="28" fill="url(#made-mid)"/>
      <rect x="214" y="626" width="36" height="66" fill="url(#made-hi)"/>
      <rect x="286" y="682" width="36" height="10" fill="url(#made-lo)"/>
      <rect x="358" y="656" width="36" height="36" fill="url(#made-mid)"/>
      <rect x="430" y="684" width="36" height="8" fill="url(#made-lo)"/>
      <rect x="502" y="670" width="36" height="22" fill="url(#made-lo)"/>
      <rect x="574" y="688" width="36" height="4" fill="url(#made-lo)"/>
      <rect x="646" y="680" width="36" height="12" fill="url(#made-lo)"/>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--fg-muted)">
      <text x="56" y="714">per-label uncertainty</text>
    </g>
  </svg>
  <figcaption>The benchmark in one picture: every model runs through every paradigm it supports and is
  scored on all six uncertainty signals. The report below is a real one from the test split
  (idx 19950511); its nine labels sit at three levels of the taxonomy, and the uncertainties shown are
  illustrative.</figcaption>
</figure>

## Classification and Uncertainty Quantification Results

Accuracy is macro-F1 and Jaccard, broken out by label frequency, because a
single average hides how badly models do on rare codes. Uncertainty is scored on
rejection ranking, per-label correlation, and calibration error.

Only the two best models per paradigm are shown, with the paradigm median above
each pair; full results are in the
[paper](https://aclanthology.org/2026.acl-long.2148/). Hover over a column
header to see what the metric means.

<table>
  <thead>
    <tr>
      <th>Paradigm / model</th>
      <th><span class="metric" tabindex="0" data-tip="Macro-averaged F1 across all 1,154 labels. Higher is better." aria-label="F1. Macro-averaged F1 across all 1,154 labels. Higher is better.">F1</span></th>
      <th><span class="metric" tabindex="0" data-tip="Macro-F1 on the most frequent labels." aria-label="Head. Macro-F1 on the most frequent labels.">Head</span></th>
      <th><span class="metric" tabindex="0" data-tip="Macro-F1 on rare labels." aria-label="Tail. Macro-F1 on rare labels.">Tail</span></th>
      <th><span class="metric" tabindex="0" data-tip="Extreme tail: macro-F1 on the rarest labels in the taxonomy." aria-label="ET. Extreme tail: macro-F1 on the rarest labels in the taxonomy.">ET</span></th>
      <th><span class="metric" tabindex="0" data-tip="Jaccard index: overlap between the predicted and the true label set. Higher is better." aria-label="J. Jaccard index: overlap between the predicted and the true label set. Higher is better.">J</span></th>
      <th><span class="metric" tabindex="0" data-tip="Prediction rejection ratio: how well a model's uncertainty ranks its own errors for human review. Higher is better." aria-label="PRR. Prediction rejection ratio: how well a model's uncertainty ranks its own errors for human review. Higher is better.">PRR</span></th>
      <th><span class="metric" tabindex="0" data-tip="Spearman correlation between per-label uncertainty and error. More negative is better." aria-label="&rho;. Spearman correlation between per-label uncertainty and error. More negative is better.">&rho;</span></th>
      <th><span class="metric" tabindex="0" data-tip="Calibration error: the gap between stated confidence and actual accuracy. Lower is better." aria-label="ECE+. Calibration error: the gap between stated confidence and actual accuracy. Lower is better.">ECE+</span></th>
    </tr>
  </thead>
  <tbody>
    <tr class="metric-group"><td class="metric-group-name">Discriminative FT</td><td><strong>.51</strong></td><td><strong>.72</strong></td><td><strong>.50</strong></td><td>.12</td><td><strong>.59</strong></td><td>.46</td><td>-.40</td><td>.59</td></tr>
    <tr><td class="metric-sub">&#8627; Llama-3.1-8B-Base</td><td>.54</td><td>.74</td><td>.53</td><td>.12</td><td>.62</td><td>.47</td><td>-.40</td><td>.58</td></tr>
    <tr><td class="metric-sub">&#8627; Ettin-1B-Encoder</td><td>.53</td><td>.73</td><td>.51</td><td>.13</td><td>.61</td><td>.46</td><td>-.40</td><td>.56</td></tr>
    <tr class="metric-group"><td class="metric-group-name">Generative FT</td><td>.48</td><td>.67</td><td>.46</td><td>.11</td><td>.58</td><td><strong>.57</strong></td><td><strong>-.44</strong></td><td><strong>.57</strong></td></tr>
    <tr><td class="metric-sub">&#8627; Llama-3.1-8B-Base</td><td>.50</td><td>.70</td><td>.48</td><td>.12</td><td>.59</td><td><strong>.63</strong></td><td>-.30</td><td>.52</td></tr>
    <tr><td class="metric-sub">&#8627; Llama-3.1-70B-Base</td><td>.53</td><td>.73</td><td>.51</td><td>.16</td><td>.61</td><td>.55</td><td>-.27</td><td>.49</td></tr>
    <tr class="metric-group"><td class="metric-group-name">Prompting, instruct</td><td>.29</td><td>.49</td><td>.25</td><td>.08</td><td>.43</td><td>.49</td><td>-.15</td><td>.68</td></tr>
    <tr><td class="metric-sub">&#8627; Qwen3-235B-Instruct</td><td>.44</td><td>.60</td><td>.42</td><td>.24</td><td>.49</td><td>.56</td><td>-.34</td><td>.56</td></tr>
    <tr><td class="metric-sub">&#8627; GPT-4.1</td><td>.43</td><td>.59</td><td>.42</td><td>.22</td><td>.57</td><td>.45</td><td>-.31</td><td>.60</td></tr>
    <tr class="metric-group"><td class="metric-group-name">Prompting, reasoning</td><td>.44</td><td>.58</td><td>.42</td><td><strong>.26</strong></td><td>.47</td><td>.21</td><td>-.07</td><td>.59</td></tr>
    <tr><td class="metric-sub">&#8627; Qwen3-235B-Thinking</td><td>.49</td><td>.62</td><td>.48</td><td>.33</td><td>.48</td><td>.34</td><td>-.09</td><td><strong>.45</strong></td></tr>
    <tr><td class="metric-sub">&#8627; GPT-5 (reasoning)</td><td><strong>.54</strong></td><td>.68</td><td>.53</td><td><strong>.34</strong></td><td>.57</td><td>NA</td><td>NA</td><td>NA</td></tr>
  </tbody>
</table>

## What we found

- Small discriminatively fine-tuned models give the best head-to-tail accuracy at a fraction of the cost of the large ones. 
- Generative fine-tuning gives the most dependable uncertainty, with the lowest variance across runs.
- Reasoning models are the only ones making real progress on the extreme tail, yet their uncertainty ordering collapses to near-random.
- Asking a model how confident it is (self-verbalized confidence) turns out to be a bad signal, with rejection ranking near zero.
- Token-level entropy is the mechanism that actually works for non-reasoning models.

The headline number is that the best model reaches 54% macro-F1. Multi-label
classification here is far from solved, and the head-to-tail gap and systematic
under-confidence leave plenty of room for better uncertainty quantification.

## Appendix

### MADE at a glance

<table class="stats">
  <tbody>
    <tr><td>Training set <span class="stat-range">2015&ndash;2023</span></td><td>298,825</td></tr>
    <tr><td>Validation <span class="stat-range">1&ndash;6/2024</span></td><td>71,271</td></tr>
    <tr><td>Test set <span class="stat-range">7/2024&ndash;6/2025</span></td><td>10,288</td></tr>
    <tr class="stat-total"><td>Total samples</td><td>488,273</td></tr>
    <tr><td>Unique labels <span class="stat-range">3 levels</span></td><td>1,154</td></tr>
    <tr><td>Avg. labels / sample</td><td>8.79</td></tr>
    <tr><td>Avg. tokens / report</td><td>~370</td></tr>
  </tbody>
</table>

### Long tail of labels

<figure>
  <svg class="chart" viewBox="0 0 720 300" role="img"
       style="display:block;width:100%;height:auto"
       aria-label="Label frequency against label rank on a log scale. The most common label appears about 130,000 times, the curve falls to roughly 1,000 occurrences by rank 450, to about 100 by rank 925, and drops to single digits for the last few of the 1,154 labels.">
    <defs>
      <pattern id="tail-ink" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="0.9" fill="var(--fg-muted)"/>
      </pattern>
    </defs>

    <g stroke="var(--border)" stroke-width="1">
      <line x1="60" y1="42.5" x2="700" y2="42.5"/>
      <line x1="60" y1="84" x2="700" y2="84"/>
      <line x1="60" y1="125.5" x2="700" y2="125.5"/>
      <line x1="60" y1="167" x2="700" y2="167"/>
      <line x1="60" y1="208.5" x2="700" y2="208.5"/>
      <line x1="60" y1="250" x2="700" y2="250"/>
    </g>

    <path d="M60.0,250.0 L60.0,37.7 L70.7,59.0 L81.3,80.7 L97.3,89.1 L113.3,96.5 L140.0,102.4 L166.7,105.7 L193.3,110.5 L220.0,113.9 L246.7,119.4 L273.3,123.0 L300.0,125.5 L326.7,127.4 L358.7,131.4 L390.7,135.9 L422.7,140.3 L433.3,142.0 L465.3,147.2 L497.3,152.0 L529.3,156.4 L548.0,159.7 L553.3,167.9 L572.0,173.4 L593.3,179.5 L614.7,182.6 L636.0,187.5 L652.0,194.3 L662.7,205.2 L670.7,221.0 L674.4,233.5 L675.5,237.5 L675.5,250.0 Z" fill="url(#tail-ink)" stroke="none"/>
    <polyline points="60.0,37.7 70.7,59.0 81.3,80.7 97.3,89.1 113.3,96.5 140.0,102.4 166.7,105.7 193.3,110.5 220.0,113.9 246.7,119.4 273.3,123.0 300.0,125.5 326.7,127.4 358.7,131.4 390.7,135.9 422.7,140.3 433.3,142.0 465.3,147.2 497.3,152.0 529.3,156.4 548.0,159.7 553.3,167.9 572.0,173.4 593.3,179.5 614.7,182.6 636.0,187.5 652.0,194.3 662.7,205.2 670.7,221.0 674.4,233.5 675.5,237.5" fill="none" stroke="var(--fg)" stroke-width="1.6"
              stroke-linejoin="round"/>

    <g font-family="var(--font-mono)" font-size="10" fill="var(--fg-muted)" text-anchor="end">
      <text x="52" y="46">10^5</text>
      <text x="52" y="87.5">10^4</text>
      <text x="52" y="129">10^3</text>
      <text x="52" y="170.5">10^2</text>
      <text x="52" y="212">10^1</text>
    </g>
    <g font-family="var(--font-mono)" font-size="10" fill="var(--fg-muted)" text-anchor="middle">
      <text x="60" y="266">0</text>
      <text x="273" y="266">400</text>
      <text x="487" y="266">800</text>
      <text x="700" y="266">1200</text>
      <text x="380" y="284">labels, ranked by frequency</text>
    </g>
  </svg>
  <figcaption>The head of the distribution is worth tens
  of thousands of examples per label, while hundreds of labels are seen fewer
  than a hundred times.</figcaption>
</figure>

### Citation

{% raw %}
```bibtex
@inproceedings{agarwal-etal-2026-made,
    title = "{MADE}: A Living Benchmark for Multi-Label Text Classification with Uncertainty Quantification of Medical Device Adverse Events",
    author = "Agarwal, Raunak  and
      Wenzel, Markus A.  and
      Baur, Simon  and
      Zimmer, Jonas  and
      Harvey, George  and
      Ma, Jackie",
    editor = "Liakata, Maria  and
      Moreira, Viviane P.  and
      Zhang, Jiajun  and
      Jurgens, David",
    booktitle = "Proceedings of the 64th Annual Meeting of the {A}ssociation for {C}omputational {L}inguistics (Volume 1: Long Papers)",
    month = jul,
    year = "2026",
    address = "San Diego, California, United States",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2026.acl-long.2148/",
    doi = "10.18653/v1/2026.acl-long.2148",
    pages = "46308--46328",
    ISBN = "979-8-89176-390-6",
    abstract = "Machine learning in high-stakes domains such as healthcare requires not only strong predictive performance but also reliable uncertainty quantification (UQ) to support human oversight. Multi-label text classification (MLTC) is a central task in this domain, yet remains challenging due to label imbalances, dependencies, and combinatorial complexity. Existing MLTC benchmarks are increasingly saturated and may be affected by training data contamination, making it difficult to distinguish genuine reasoning capabilities from memorization. We introduce MADE, a living MLTC benchmark derived from {m}edical device {ad}verse {e}vent reports and continuously updated with newly published reports to prevent contamination. MADE features a long-tailed distribution of hierarchical labels and enables reproducible evaluation with strict temporal splits. We establish baselines across more than 20 encoder- and decoder-only models under fine-tuning and few-shot settings (instruction-tuned/reasoning variants, local/API-accessible). We systematically assess entropy-/consistency-based and self-verbalized UQ methods. Results show clear trade-offs: smaller discriminatively fine-tuned decoders achieve the strongest head-to-tail accuracy while maintaining competitive UQ; generative fine-tuning delivers the most reliable UQ; large reasoning models improve performance on rare labels yet exhibit surprisingly weak UQ; and self-verbalized confidence is not a reliable proxy for uncertainty. Our work is publicly available at https://hhi.fraunhofer.de/aml-demonstrator/made-benchmark."
}
```
{% endraw %}

---

## Links

* Code: [github.com/raunak-agarwal/made-benchmark](https://github.com/raunak-agarwal/made-benchmark)
* Dataset: [ragarwal/MADE-Multilabel-Benchmark](https://huggingface.co/datasets/ragarwal/MADE-Multilabel-Benchmark)
* Leaderboard and demo: [hhi.fraunhofer.de/aml-demonstrator/made-benchmark](https://hhi.fraunhofer.de/aml-demonstrator/made-benchmark)
