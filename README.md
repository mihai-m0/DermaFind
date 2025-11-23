https://colab.research.google.com/drive/1NDn9HKmqzOuUSapkcAyUHMeDnRkWXd5_?usp=sharing
# Dermafind - AI Core & Backend

Acesta este repository-ul care conține "creierul" aplicației Dermafind (modelul de Deep Learning) și serverul de backend care face legătura cu interfața.

## 🧠 Abordarea Tehnică
Nu am optimizat modelul doar pentru acuratețe brută ("vanity metrics"), ci pentru *Siguranță Medicală*.
* *Model:* EfficientNetB3 (Transfer Learning) pe rezoluție 300x300px (pentru a detecta texturile fine ale leziunilor).
* *Filozofie:* Am calibrat modelul să fie un "Medic Precaut". Am folosit *Class Weights* (Melanom: 2.0 vs Nevus: 1.0) pentru a penaliza dur ratarea unui cancer. Preferăm o alarmă falsă (False Positive) decât să trimitem acasă un pacient bolnav.
* *TTA (Test Time Augmentation):* La inferență, modelul analizează imaginea din 5 unghiuri/zoom-uri diferite și face media probabilităților pentru un diagnostic robust
