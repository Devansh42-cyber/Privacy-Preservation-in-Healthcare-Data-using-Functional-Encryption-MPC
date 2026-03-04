import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from crypto_core.utils.generate_dataset import generate_dataset
from crypto_core.fe_module.fe_core import vector_to_list, setup, encrypt

data = generate_dataset(1)
patient = data[0]
vector = vector_to_list(patient)
mpk, msk = setup()
ciphertext, r = encrypt(mpk, vector)
print("Original Vector:", vector)
print("Encrypted Vector:", ciphertext)