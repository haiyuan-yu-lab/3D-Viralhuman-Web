import numpy as np
from django.db import models
from django.template.defaulttags import register


# Create your models here.
class Protein(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    is_viral = models.CharField(max_length=10)
    gene_name = models.TextField()
    protein_name_true = models.TextField(null=True)
    gene_name_true = models.TextField(null=True)
    uniprot = models.CharField(max_length=50, null=True)
    length = models.IntegerField()
    taxid = models.CharField(max_length=100, null=True)
    sequence = models.TextField()


class Interface(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='itf_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='itf_p2', on_delete=models.CASCADE)
    source = models.CharField(max_length=100)
    p1_ires = models.TextField(null=True)
    p2_ires = models.TextField(null=True)

    def p1_ires_as_list(self):
        if self.p1_ires is None:
            return []
        return self.p1_ires.split(',')

    def p2_ires_as_list(self):
        if self.p2_ires is None:
            return []
        return self.p2_ires.split(',')


class PopVarEnrichment(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='popvarenr_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='popvarenr_p2', on_delete=models.CASCADE)
    logodds = models.FloatField(null=True)
    ci_lower = models.FloatField(null=True)
    ci_upper = models.FloatField(null=True)
    pvalue = models.FloatField(null=True)
    ires_novar = models.IntegerField()
    ires_var = models.IntegerField()
    noires_var = models.IntegerField()
    noires_novar = models.IntegerField()


class PopVar(models.Model):
    id = models.AutoField(primary_key=True)
    uniprot = models.ForeignKey(Protein, related_name='pop_var_prot', on_delete=models.CASCADE)
    chrom = models.CharField(max_length=2)
    pos = models.IntegerField()
    ref = models.CharField(max_length=1)
    alt = models.CharField(max_length=1)
    rsid = models.CharField(max_length=12, null=True)
    aa_pos = models.IntegerField()
    aa_ref = models.CharField(max_length=1)
    aa_alt = models.CharField(max_length=1)
    sift_category = models.CharField(max_length=26, null=True)
    sift_score = models.FloatField(null=True)
    polyphen_category = models.CharField(max_length=17, null=True)
    polyphen_score = models.FloatField(null=True)
    gnomad_af = models.FloatField(null=True)
    clnsig = models.TextField(null=True)
    somatic = models.CharField(max_length=7, null=True)
    pheno = models.CharField(max_length=7, null=True)


class ViralMutEnrichment(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='viralmutenr_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='viralmutenr_p2', on_delete=models.CASCADE)
    logodds = models.FloatField(null=True)
    ci_lower = models.FloatField(null=True)
    ci_upper = models.FloatField(null=True)
    pvalue = models.FloatField(null=True)
    ires_novar = models.IntegerField()
    ires_var = models.IntegerField()
    noires_var = models.IntegerField()
    noires_novar = models.IntegerField()


class ViralMut(models.Model):
    id = models.AutoField(primary_key=True)
    prot = models.ForeignKey(Protein, related_name='viral_mut_prot', on_delete=models.CASCADE)
    sars_prot = models.CharField(max_length=6)
    covid_pos = models.IntegerField()
    covid_aa = models.CharField(max_length=1)
    sars_pos = models.IntegerField()
    sars_aa = models.CharField(max_length=1)


class DockedModel(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='docked_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='docked_p2', on_delete=models.CASCADE)
    attempt = models.IntegerField()
    file = models.CharField(max_length=50)
    priority = models.IntegerField()
    score = models.FloatField()


class SingleModel(models.Model):
    id = models.AutoField(primary_key=True)
    prot = models.ForeignKey(Protein, related_name='single_struct', on_delete=models.CASCADE)
    source = models.CharField(max_length=50)
    file = models.CharField(max_length=200)
    #Added May 29 2021
    coverage = models.TextField(null=True)
    pdb_id = models.TextField(null=True)
    chain = models.TextField(null=True)
    modbase_id = models.CharField(max_length=200, null=True)
    #Added May 29 2021
    sourcedisplay = models.CharField(max_length=200)
    #
    res_range = models.TextField()


class Drug(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=32)
    p1 = models.ForeignKey(Protein, related_name='drug_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='drug_p2', on_delete=models.CASCADE)
    status = models.CharField(max_length=32)
    activity_type = models.TextField()
    activity = models.TextField(null=True)
    reference = models.TextField(null=True)
    smiles = models.TextField()
    zinc_id = models.CharField(max_length=20, null=True)


class Domain(models.Model):
    id = models.AutoField(primary_key=True)
    prot = models.ForeignKey(Protein, related_name='domain_prot', on_delete=models.CASCADE)
    is_domain = models.TextField()


class DDGSummary(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='ddg_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='ddg_p2', on_delete=models.CASCADE)
    ddg = models.FloatField()
    ddg_std = models.FloatField()
    pvalue = models.FloatField()
    pdbfile = models.TextField()


class InterfaceSimilarity(models.Model):
    id = models.AutoField(primary_key=True)
    p1 = models.ForeignKey(Protein, related_name='similarity_p1', on_delete=models.CASCADE)
    p2 = models.ForeignKey(Protein, related_name='similarity_p2', on_delete=models.CASCADE)
    p2_gene = models.TextField()
    p2_gene_true = models.TextField(null=True)
    p2_protein_true = models.TextField(null=True)
    is_viral = models.CharField(max_length=20)
    interactor = models.CharField(max_length=20)
    interactor_gene = models.TextField()
    interactor_gene_true = models.TextField(null=True)
    interactor_protein_true = models.TextField(null=True)
    similarity = models.FloatField()
    ires = models.TextField(null=True)
    ires_mask = models.TextField(null=True)
